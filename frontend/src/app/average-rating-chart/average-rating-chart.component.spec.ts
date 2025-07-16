import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AverageRatingChartComponent } from './average-rating-chart.component';

describe('AverageRatingChartComponent', () => {
  let component: AverageRatingChartComponent;
  let fixture: ComponentFixture<AverageRatingChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AverageRatingChartComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AverageRatingChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
