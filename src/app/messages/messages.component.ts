import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from '../messages/message.service';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit, OnDestroy {
  conversations: any[] = [];
  activeConversation: any = null;
  messages: any[] = [];
  newMessageText = '';
  currentUserId = '';

  constructor(
    private messageService: MessageService,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.currentUserId = this.authService.getUser()?.id || '';
    this.messageService.connect();

    this.messageService.newMessage$.subscribe((msg) => {
      if (msg && this.activeConversation && msg.conversation === this.activeConversation._id) {
        this.messages.push(msg);
      }
      // bump the conversation preview in the sidebar without a refetch
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
    this.messageService.getMessages(convo._id).subscribe((msgs) => this.messages = msgs);
  }

  send() {
    if (!this.newMessageText.trim() || !this.activeConversation) return;
    this.messageService.sendMessage(this.activeConversation._id, this.newMessageText.trim());
    this.newMessageText = '';
  }

  otherParty(convo: any) {
  return convo.customer._id === this.currentUserId ? convo.seller : convo.customer;
}

getDisplayName(user: any): string {
  return user?.storeDetails?.storeName || user?.username || 'Unknown User';
}

  // Returns a single uppercase letter to use as a placeholder avatar
  // when the user has no profileImage saved in MongoDB.
  getInitial(user: any): string {
  const source = this.getDisplayName(user) || user?.email || '';
  return source ? source.charAt(0).toUpperCase() : '?';
}

  ngOnDestroy() {
    this.messageService.disconnect();
  }
}