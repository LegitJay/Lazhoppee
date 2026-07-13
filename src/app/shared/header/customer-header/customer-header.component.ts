import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../../../services/cart.service';
import { AuthService, AuthUser } from '../../../services/auth.service';
import { MessageService } from '../../../services/message.service';

@Component({
  selector: 'app-customer-header',
  templateUrl: './customer-header.component.html',
  styleUrls: ['./customer-header.component.css']
})
export class CustomerHeaderComponent implements OnInit {
  title = 'online-selling-app';

  // ----- existing state (unchanged) -----
  user: AuthUser | null = null;
  cartCount: number = 0;
  unreadCount: number = 0;
  searchTerm: string = '';

  // ----- new header state -----
  notificationCount: number = 0;
  wishlistCount: number = 0;

  isMobileMenuOpen = false;
  isProfileMenuOpen = false;
  isLangMenuOpen = false;
  isCartPreviewOpen = false;
  isSearchFocused = false;

  selectedLanguage = 'EN';
  languages: string[] = ['EN', 'FIL'];

  // Placeholder trending keywords for the search bar.
  // Replace with a real "trending searches" API call when available.
  trendingKeywords: string[] = ['Shoes', 'Laptop', 'Phone', 'Jersey', 'Gaming', 'Fashion', 'Accessories'];

  constructor(
    private cartService: CartService,
    public authService: AuthService,
    private messageService: MessageService,
    private router: Router,
    private elementRef: ElementRef
  ) { }

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      this.user = user;
    });

    this.cartService.cartCount$.subscribe((count: number) => {
      this.cartCount = count;
    });

    if (this.authService.isLoggedIn()) {
      this.cartService.refreshCartCount();
      this.refreshUnreadCount();
    }
  }

  refreshUnreadCount(): void {
    this.messageService.getConversations().subscribe((convos: any[]) => {
      this.unreadCount = convos.filter(c => c.hasUnread).length;
    });
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  get isStoreOwner(): boolean {
    return this.authService.getUser()?.role === 'storeOwner';
  }

  get isAdminRoute(): boolean {
    return this.router.url.startsWith('/admin');
  }

  onSearch(): void {
    this.router.navigate(['/products'], { queryParams: { q: this.searchTerm } });
  }

  logout(): void {
    this.authService.logout();
    this.cartService.reset();
    this.unreadCount = 0;
    this.router.navigate(['/auth']);
  }

  // ----------------------------------------------------------------
  // Helper methods for the redesigned header.
  // Everything below is additive and does not change existing behavior.
  // ----------------------------------------------------------------

  /** First initial of the logged-in user's name, used for the avatar bubble. */
  getUserInitial(): string {
    const username = this.authService.getUser()?.username;
    return username ? username.trim().charAt(0).toUpperCase() : '?';
  }

  /** Simple client-side filter over the trending list for the suggestions dropdown.
   *  Swap this for a real autocomplete/search-suggestions endpoint when one exists. */
  getFilteredSuggestions(): string[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      return this.trendingKeywords;
    }
    return this.trendingKeywords.filter(keyword => keyword.toLowerCase().includes(term));
  }

  /** Fills the search box from a trending chip or suggestion and runs the existing search. */
  searchByKeyword(keyword: string): void {
    this.searchTerm = keyword;
    this.isSearchFocused = false;
    this.onSearch();
  }

  onSearchFocus(): void {
    this.isSearchFocused = true;
  }

  onSearchBlur(): void {
    // Slight delay so a click on a suggestion/chip registers before the list closes.
    setTimeout(() => (this.isSearchFocused = false), 120);
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  toggleProfileMenu(): void {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
    this.isLangMenuOpen = false;
  }

  closeProfileMenu(): void {
    this.isProfileMenuOpen = false;
  }

  toggleLangMenu(): void {
    this.isLangMenuOpen = !this.isLangMenuOpen;
    this.isProfileMenuOpen = false;
  }

  selectLanguage(lang: string): void {
    this.selectedLanguage = lang;
    this.isLangMenuOpen = false;
    // Hook this into a real i18n service when one is added.
  }

  getUserImage(): string | null {
    return this.user?.profileImage || null;
  }

  showCartPreview(): void {
    this.isCartPreviewOpen = true;
  }

  hideCartPreview(): void {
    this.isCartPreviewOpen = false;
  }

  /** Closes open dropdowns when the user clicks anywhere outside the header. */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isProfileMenuOpen = false;
      this.isLangMenuOpen = false;
      this.isCartPreviewOpen = false;
    }
  }

  /** Closes the mobile menu automatically if the viewport is resized past the breakpoint. */
  @HostListener('window:resize')
  onWindowResize(): void {
    if (window.innerWidth > 720 && this.isMobileMenuOpen) {
      this.isMobileMenuOpen = false;
    }
  }
}