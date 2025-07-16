import { Component, OnInit, OnDestroy } from '@angular/core';
import * as Stomp from '@stomp/stompjs';
import SockJS from 'sockjs-client/dist/sockjs.js';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-notification-test',
  templateUrl: './notification-test.html',
  styleUrls: ['./notification-test.css']
})
export class NotificationTest implements OnInit, OnDestroy {
  public notifications = new BehaviorSubject<string[]>([]);
  private stompClient: Stomp.Client | null = null;

  ngOnInit() {
    this.connect();
  }

  ngOnDestroy() {
    if (this.stompClient) {
      this.stompClient.deactivate();
    }
  }

  connect() {
    console.log('Attempting to connect to WebSocket...');
    const socket = new SockJS('http://localhost:8099/ws');
    this.stompClient = new Stomp.Client({
      webSocketFactory: () => socket as any,
      debug: (str) => console.log('STOMP Debug:', str),
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('✅ WebSocket connected successfully!');
        this.stompClient?.subscribe('/topic/public-noti', (message) => {
          console.log('📨 WebSocket message received:', message.body);
          console.log('📨 Message type:', typeof message.body);
          console.log('📨 Message length:', message.body?.length);
          
          if (message.body) {
            try {
              // Try to parse as JSON first (for Message objects)
              let messageContent;
              try {
                const msgObj = JSON.parse(message.body);
                console.log('📨 Parsed JSON object:', msgObj);
                console.log('📨 Available properties:', Object.keys(msgObj));
                
                // Check if it's an event notification
                if (msgObj.eventName && msgObj.eventId) {
                  messageContent = `🎉 New Event: ${msgObj.eventName} (ID: ${msgObj.eventId})`;
                } else if (msgObj.messageContent) {
                  messageContent = msgObj.messageContent;
                } else if (msgObj.message) {
                  messageContent = msgObj.message;
                } else if (msgObj.content) {
                  messageContent = msgObj.content;
                } else {
                  // If no specific event properties, show a formatted version
                  messageContent = this.formatJsonMessage(msgObj);
                }
              } catch {
                // If not JSON, use the message body directly (for simple strings)
                console.log('📨 Using message body directly as string');
                messageContent = message.body;
              }
              console.log('✅ Final message content:', messageContent);
              const currentNotifications = this.notifications.value;
              this.notifications.next([...currentNotifications, messageContent]);
              console.log('✅ Notification added to UI');
            } catch (error) {
              console.error('❌ Error processing message:', error);
            }
          }
        });
        console.log('🎧 Subscribed to /topic/public-noti');
      },
      onStompError: (frame) => {
        console.error('❌ WebSocket error: ' + frame.headers['message']);
        console.error('❌ Error details: ' + frame.body);
      }
    });
    this.stompClient.activate();
  }

  private formatJsonMessage(obj: any): string {
    // Format JSON object into a readable message
    if (typeof obj === 'object' && obj !== null) {
      const entries = Object.entries(obj);
      if (entries.length === 0) return 'Empty notification';
      
      const formattedParts = entries.map(([key, value]) => {
        const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        return `${formattedKey}: ${value}`;
      });
      
      return `📢 ${formattedParts.join(', ')}`;
    }
    return String(obj);
  }
}
