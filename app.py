from flask import Flask, jsonify, request, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_restx import Api, Resource, fields
from datetime import datetime
from sqlalchemy import text, func
from flask_cors import CORS
import py_eureka_client.eureka_client as eureka_client
import os

app = Flask(__name__)
CORS(app, origins=["http://localhost:4200"], supports_credentials=True, methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"], allow_headers=["Content-Type", "Authorization"])

# PostgreSQL configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get(
    'SQLALCHEMY_DATABASE_URI',
    'postgresql+psycopg2://analytics_user:anasbentalouba@postgres:5432/analytics_db'
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Eureka Client Configuration
EUREKA_SERVER_URL = "http://localhost:8761/eureka"
APP_NAME = "event-analytics-service"
APP_PORT = 5003

# Initialize Eureka Client
try:
    eureka_client.init(
        eureka_server=EUREKA_SERVER_URL,
        app_name=APP_NAME,
        instance_port=APP_PORT,
        instance_host="localhost",
        renewal_interval_in_secs=30,
        duration_in_secs=90,
        metadata={"management.port": APP_PORT}
    )
    print(f"✅ Eureka Client initialized for {APP_NAME}")
except Exception as e:
    print(f"⚠️  Eureka Client initialization failed: {e}")
    print("Continuing without Eureka registration...")

api = Api(
    app,
    version='1.0',
    title='Event Analytics API',
    description='API for managing event analytics - Microservice',
    doc='/docs',
    prefix='/api'
)

# =======================
# Database Model
# =======================
class EventAnalytics(db.Model):
    __tablename__ = 'event_analytics'
    id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.Integer, nullable=False, index=True)
    views = db.Column(db.Integer, default=0)
    bookings = db.Column(db.Integer, default=0)
    date = db.Column(db.DateTime, default=datetime.utcnow)  # Default to current time if not provided
    organizer = db.Column(db.String, default="")
    rating = db.Column(db.Integer, default=0)

    def to_dict(self):
        return {
            'id': self.id,
            'event_id': self.event_id,
            'views': self.views,
            'bookings': self.bookings,
            'date': self.date.isoformat() if self.date else None,
            'organizer': self.organizer,
            'rating': self.rating
        }

# =======================
# Root & Health Check
# =======================
@app.route('/health')
def health_check():
    try:
        db.session.execute(text('SELECT 1'))
        return jsonify({
            "status": "healthy",
            "database": "connected",
            "tables": {
                "event_analytics": EventAnalytics.query.count()
            }
        })
    except Exception as e:
        return jsonify({
            "status": "unhealthy",
            "error": str(e),
            "solution": "Check database connection settings"
        }), 500

# =======================
# API Namespace & Models
# =======================
ns = api.namespace('analytics', description='Analytics operations')

analytics_model = api.model('Analytics', {
    'id': fields.Integer(readOnly=True),
    'event_id': fields.Integer(required=True),
    'views': fields.Integer(default=0),
    'bookings': fields.Integer(default=0),
    'date': fields.DateTime(dt_format='iso8601'),
    'organizer': fields.String(default=""),
    'rating': fields.Integer(default=0)
})

average_rating_model = api.model('AverageRating', {
    'organizer': fields.String,
    'average_rating': fields.Float
})

monthly_count_model = api.model('MonthlyCount', {
    'month': fields.String,
    'organizer': fields.String,
    'event_count': fields.Integer
})

# =======================
# CRUD Endpoints
# =======================
@ns.route('/')
class AnalyticsResource(Resource):
    @ns.marshal_list_with(analytics_model)
    def get(self):
        """Get all analytics records, optionally filtered by organizer"""
        try:
            organizer = request.args.get('organizer')
            query = EventAnalytics.query
            if organizer:
                query = query.filter(func.lower(EventAnalytics.organizer) == organizer.lower())
            return query.order_by(EventAnalytics.date.desc()).all()
        except Exception as e:
            return {'message': 'Error fetching analytics', 'error': str(e)}, 500

    @ns.expect(analytics_model)
    @ns.marshal_with(analytics_model, code=201)
    def post(self):
        """Create a new analytics record"""
        try:
            data = api.payload
            if not data or 'event_id' not in data:
                return {'message': 'event_id is required'}, 400

            # Handle date parsing - use provided date or default to current time
            date_value = None
            if 'date' in data and data['date']:
                try:
                    # Remove 'Z' if present and parse ISO format
                    date_str = data['date'].replace('Z', '') if 'Z' in data['date'] else data['date']
                    date_value = datetime.fromisoformat(date_str)
                except ValueError as e:
                    return {'message': 'Invalid date format. Use ISO format (YYYY-MM-DDTHH:MM:SS)', 'error': str(e)}, 400
            else:
                date_value = datetime.utcnow()  # Default to current time if not provided

            new_record = EventAnalytics(
                event_id=data['event_id'],
                views=data.get('views', 0),
                bookings=data.get('bookings', 0),
                date=date_value,  # Use parsed date or current time
                organizer=data.get('organizer', ""),
                rating=data.get('rating', 0)
            )
            db.session.add(new_record)
            db.session.commit()
            return new_record, 201
        except Exception as e:
            return {'message': 'Error creating record', 'error': str(e)}, 500

@ns.route('/<int:id>')
@ns.param('id', 'The analytics record ID')
class AnalyticsItem(Resource):
    @ns.marshal_with(analytics_model)
    def get(self, id):
        """Get a specific analytics record by ID"""
        try:
            return EventAnalytics.query.get_or_404(id)
        except Exception as e:
            return {'message': 'Record not found', 'error': str(e)}, 404

    @ns.expect(analytics_model)
    @ns.marshal_with(analytics_model)
    def put(self, id):
        """Update an existing analytics record"""
        try:
            record = EventAnalytics.query.get_or_404(id)
            data = api.payload
            
            # Update standard fields
            record.event_id = data.get('event_id', record.event_id)
            record.views = data.get('views', record.views)
            record.bookings = data.get('bookings', record.bookings)
            record.organizer = data.get('organizer', record.organizer)
            record.rating = data.get('rating', record.rating)
            
            # Handle date update if provided
            if 'date' in data and data['date']:
                try:
                    # Remove 'Z' if present and parse ISO format
                    date_str = data['date'].replace('Z', '') if 'Z' in data['date'] else data['date']
                    record.date = datetime.fromisoformat(date_str)
                except ValueError as e:
                    return {'message': 'Invalid date format. Use ISO format (YYYY-MM-DDTHH:MM:SS)', 'error': str(e)}, 400
            
            db.session.commit()
            return record
        except Exception as e:
            return {'message': 'Error updating record', 'error': str(e)}, 500

    @ns.response(204, 'Record deleted')
    def delete(self, id):
        """Delete an analytics record"""
        try:
            record = EventAnalytics.query.get_or_404(id)
            db.session.delete(record)
            db.session.commit()
            return '', 204
        except Exception as e:
            return {'message': 'Error deleting record', 'error': str(e)}, 500

# =======================
# Average Rating Endpoint
# =======================
@ns.route('/average-rating')
class AverageRating(Resource):
    @ns.marshal_list_with(average_rating_model)
    def get(self):
        """Get average rating per organizer"""
        try:
            query = """
                SELECT organizer, ROUND(AVG(rating)::numeric, 2) AS average_rating
                FROM event_analytics
                WHERE rating IS NOT NULL
                GROUP BY organizer
            """
            result = db.session.execute(text(query)).mappings().all()
            return [dict(row) for row in result]
        except Exception as e:
            return {'message': 'Error fetching average ratings', 'error': str(e)}, 500

# =======================
# Monthly Count Endpoint
# =======================
@ns.route('/monthly-count')
class MonthlyCount(Resource):
    @ns.marshal_list_with(monthly_count_model)
    def get(self):
        """Get number of events per month per organizer"""
        try:
            query = """
                SELECT TO_CHAR(date, 'YYYY-MM') AS month,
                       organizer,
                       COUNT(*) AS event_count
                FROM event_analytics
                GROUP BY month, organizer
                ORDER BY month ASC, organizer ASC
            """
            result = db.session.execute(text(query)).mappings().all()
            return [dict(row) for row in result]
        except Exception as e:
            return {'message': 'Error fetching monthly counts', 'error': str(e)}, 500

# =======================
# Advanced Search Endpoint
# =======================
@ns.route('/search')
class AdvancedSearch(Resource):
    def get(self):
        """Advanced search with multiple filters, sorting, and pagination"""
        try:
            # Get search and filter parameters
            search_query = request.args.get('q', '').strip()
            start_date = request.args.get('start_date')
            end_date = request.args.get('end_date')
            organizer = request.args.get('organizer')
            min_rating = request.args.get('min_rating')
            max_rating = request.args.get('max_rating')
            min_views = request.args.get('min_views')
            max_views = request.args.get('max_views')
            min_bookings = request.args.get('min_bookings')
            max_bookings = request.args.get('max_bookings')
            
            # Sorting parameters
            sort_by = request.args.get('sort', 'date')
            sort_order = request.args.get('order', 'desc')
            
            # Pagination parameters
            page = int(request.args.get('page', 1))
            limit = int(request.args.get('limit', 20))
            offset = (page - 1) * limit
            
            # Build query
            query = EventAnalytics.query
            
            # Text search across multiple fields
            if search_query:
                search_filter = (
                    EventAnalytics.organizer.ilike(f'%{search_query}%') |
                    EventAnalytics.event_id.cast(db.String).ilike(f'%{search_query}%')
                )
                query = query.filter(search_filter)
            
            # Date range filter
            if start_date:
                try:
                    start_dt = datetime.fromisoformat(start_date.replace('Z', ''))
                    query = query.filter(EventAnalytics.date >= start_dt)
                except ValueError:
                    pass
            
            if end_date:
                try:
                    end_dt = datetime.fromisoformat(end_date.replace('Z', ''))
                    query = query.filter(EventAnalytics.date <= end_dt)
                except ValueError:
                    pass
            
            # Organizer filter
            if organizer:
                query = query.filter(func.lower(EventAnalytics.organizer) == organizer.lower())
            
            # Rating range filter
            if min_rating:
                try:
                    query = query.filter(EventAnalytics.rating >= float(min_rating))
                except ValueError:
                    pass
            
            if max_rating:
                try:
                    query = query.filter(EventAnalytics.rating <= float(max_rating))
                except ValueError:
                    pass
            
            # Views range filter
            if min_views:
                try:
                    query = query.filter(EventAnalytics.views >= int(min_views))
                except ValueError:
                    pass
            
            if max_views:
                try:
                    query = query.filter(EventAnalytics.views <= int(max_views))
                except ValueError:
                    pass
            
            # Bookings range filter
            if min_bookings:
                try:
                    query = query.filter(EventAnalytics.bookings >= int(min_bookings))
                except ValueError:
                    pass
            
            if max_bookings:
                try:
                    query = query.filter(EventAnalytics.bookings <= int(max_bookings))
                except ValueError:
                    pass
            
            # Sorting
            sort_column = getattr(EventAnalytics, sort_by, EventAnalytics.date)
            if sort_order.lower() == 'desc':
                query = query.order_by(sort_column.desc())
            else:
                query = query.order_by(sort_column.asc())
            
            # Pagination
            total_count = query.count()
            results = query.offset(offset).limit(limit).all()
            
            # Convert results to dictionaries
            data = [record.to_dict() for record in results]
            
            # Return results with pagination info
            return {
                'data': data,
                'pagination': {
                    'page': page,
                    'limit': limit,
                    'total': total_count,
                    'pages': (total_count + limit - 1) // limit
                }
            }
            
        except Exception as e:
            return {'message': 'Error performing search', 'error': str(e)}, 500

# =======================
# Filter Options Endpoint
# =======================
@ns.route('/filter-options')
class FilterOptions(Resource):
    def get(self):
        """Get available filter options (organizers, date ranges, etc.)"""
        try:
            # Get all organizers
            organizers = db.session.query(EventAnalytics.organizer).distinct().all()
            organizer_list = [org[0] for org in organizers if org[0]]
            
            # Get date range
            date_range = db.session.query(
                func.min(EventAnalytics.date),
                func.max(EventAnalytics.date)
            ).first()
            
            # Get rating range
            rating_range = db.session.query(
                func.min(EventAnalytics.rating),
                func.max(EventAnalytics.rating)
            ).filter(EventAnalytics.rating > 0).first()
            
            # Get views range
            views_range = db.session.query(
                func.min(EventAnalytics.views),
                func.max(EventAnalytics.views)
            ).first()
            
            # Get bookings range
            bookings_range = db.session.query(
                func.min(EventAnalytics.bookings),
                func.max(EventAnalytics.bookings)
            ).first()
            
            return {
                'organizers': sorted(organizer_list),
                'date_range': {
                    'min': date_range[0].isoformat() if date_range[0] else None,
                    'max': date_range[1].isoformat() if date_range[1] else None
                },
                'rating_range': {
                    'min': float(rating_range[0]) if rating_range[0] else 0,
                    'max': float(rating_range[1]) if rating_range[1] else 5
                },
                'views_range': {
                    'min': int(views_range[0]) if views_range[0] else 0,
                    'max': int(views_range[1]) if views_range[1] else 0
                },
                'bookings_range': {
                    'min': int(bookings_range[0]) if bookings_range[0] else 0,
                    'max': int(bookings_range[1]) if bookings_range[1] else 0
                }
            }
            
        except Exception as e:
            return {'message': 'Error fetching filter options', 'error': str(e)}, 500

# =======================
# DB Init
# =======================
def initialize_database():
    with app.app_context():
        db.create_all()
        if EventAnalytics.query.count() == 0:
            # Create sample records with specific dates for testing
            sample1 = EventAnalytics(
                event_id=1,
                views=150,
                bookings=20,
                date=datetime(2023, 6, 15, 10, 30),  # Specific date for testing
                organizer='test',
                rating=4
            )
            sample2 = EventAnalytics(
                event_id=2,
                views=200,
                bookings=35,
                date=datetime(2023, 7, 1, 14, 0),  # Specific date for testing
                organizer='another_organizer',
                rating=3.5
            )
            db.session.add(sample1)
            db.session.add(sample2)
            db.session.commit()
        print("✅ Database initialized with sample data")

# =======================
# Main
# =======================
if __name__ == '__main__':
    initialize_database()

    print("\n🌐 Available Endpoints:")
    print(f" - API Documentation: http://localhost:5000/docs")
    print(f" - Health Check: http://localhost:5000/health")
    print(f" - Analytics API: http://localhost:5000/api/analytics")
    print(f" - Average Rating: http://localhost:5000/api/analytics/average-rating")
    print(f" - Monthly Count: http://localhost:5000/api/analytics/monthly-count")
    print(f" - Filter by organizer: http://localhost:5000/api/analytics?organizer=test")
    print(f"\n🔍 Advanced Search Endpoints:")
    print(f" - Search: http://localhost:5000/api/analytics/search")
    print(f" - Filter Options: http://localhost:5000/api/analytics/filter-options")
    print(f"\n💡 Search Examples:")
    print(f" - Basic search: /api/analytics/search?q=john")
    print(f" - With filters: /api/analytics/search?q=test&min_rating=4&sort=views&order=desc")
    print(f" - With pagination: /api/analytics/search?page=1&limit=10")
    print(f"\n🔗 Microservices Integration:")
    print(f" - Eureka Server: {EUREKA_SERVER_URL}")
    print(f" - Service Name: {APP_NAME}")
    print(f" - Service Port: {APP_PORT}")
    print(f" - Eureka Dashboard: http://localhost:8761")
    print(f" - Your service will appear as '{APP_NAME}' in Eureka\n")

    app.run(host='0.0.0.0', port=APP_PORT, debug=True)

# Serve Angular static files for all non-API routes
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    if path != "" and os.path.exists(os.path.join('static', path)):
        return send_from_directory('static', path)
    else:
        return send_from_directory('static', 'index.html')