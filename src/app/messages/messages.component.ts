import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from '../services/message.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit, OnDestroy {
  @ViewChild('messagesScroll') messagesScroll!: ElementRef<HTMLDivElement>;

  conversations: any[] = [];
  activeConversation: any = null;
  messages: any[] = [];
  newMessageText = '';
  currentUserId = '';

  constructor(
    private messageService: MessageService,
    private authService: AuthService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.currentUserId = this.authService.getUser()?.id || '';
    this.messageService.connect();

    this.messageService.newMessage$.subscribe((msg) => {
      if (!msg) return;

      if (this.activeConversation && msg.conversation === this.activeConversation._id) {
        const alreadyShown = this.messages.some(m =>
          m._id && msg._id && m._id === msg._id
        );
        if (!alreadyShown) {
          this.messages.push(msg);
          this.scrollToBottom();
        }
      }

      const convo = this.conversations.find(c => c._id === msg?.conversation);
      if (convo) {
        convo.lastMessage = msg.text;
        convo.lastMessageAt = msg.createdAt;
      }
    });

    this.messageService.getConversations().subscribe((convos) => {
      this.conversations = convos;
      const preselect = this.route.snapshot.queryParamMap.get('conversation');
      if (preselect) {
        const found = convos.find(c => c._id === preselect);
        if (found) this.selectConversation(found);
      }
    });
  }

  selectConversation(convo: any) {
    this.activeConversation = convo;
    this.messageService.joinConversation(convo._id);
    this.messageService.getMessages(convo._id).subscribe((msgs) => {
      this.messages = msgs;
      this.scrollToBottom();
    });
  }

  send() {
    if (!this.newMessageText.trim() || !this.activeConversation) return;

    const text = this.newMessageText.trim();

    this.messageService.sendMessage(this.activeConversation._id, text);
    this.newMessageText = '';

    // No optimistic push — the backend now broadcasts 'newMessage' back to the
    // sender via the room (io.to(conversationId).emit), so it will arrive
    // through newMessage$ just like it does for the other participant.
  }

  private scrollToBottom() {
    // Wait a tick so Angular has rendered the new message into the DOM first
    setTimeout(() => {
      if (this.messagesScroll) {
        const el = this.messagesScroll.nativeElement;
        el.scrollTop = el.scrollHeight;
      }
    }, 0);
  }

  otherParty(convo: any) {
    if (!convo || !convo.customer || !convo.seller) return null;
    return convo.customer._id === this.currentUserId ? convo.seller : convo.customer;
  }

  getDisplayName(user: any): string {
    if (user?.storeName?.trim()) return user.storeName;
    return user?.username || user?.email || 'Unknown User';
  }

  getInitial(user: any): string {
    const source = this.getDisplayName(user) || user?.email || '';
    return source ? source.charAt(0).toUpperCase() : '?';
  }

  ngOnDestroy() {
    this.messageService.disconnect();
  }
}