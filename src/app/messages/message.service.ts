import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MessageService {
  private socket!: Socket;
  public newMessage$ = new BehaviorSubject<any>(null);

  constructor(private http: HttpClient) {}

  connect() {
    if (this.socket?.connected) return;
    const token = localStorage.getItem('token');
    this.socket = io(environment.apiUrl, { auth: { token } });
    this.socket.on('newMessage', (msg) => this.newMessage$.next(msg));
  }

  joinConversation(conversationId: string) {
    this.socket.emit('joinConversation', conversationId);
  }

  sendMessage(conversationId: string, text: string) {
    this.socket.emit('sendMessage', { conversationId, text });
  }

  disconnect() {
    this.socket?.disconnect();
  }

  getConversations() {
    return this.http.get<any[]>(`${environment.apiUrl}/messages/conversations`);
  }

  startConversation(sellerId: string, productId?: string) {
    return this.http.post<any>(`${environment.apiUrl}/messages/conversations`, { sellerId, productId });
  }

  getMessages(conversationId: string) {
    return this.http.get<any[]>(`${environment.apiUrl}/messages/conversations/${conversationId}/messages`);
  }
}