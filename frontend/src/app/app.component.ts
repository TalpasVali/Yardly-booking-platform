import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './layout/navbar/navbar.component';
import { FooterComponent } from './layout/footer/footer.component';
import { YardlyToastContainerComponent } from './shared-ui/toast/yardly-toast-container/yardly-toast-container.component';
import { AuthStore } from './features/auth/store/auth.store';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    NavbarComponent,
    FooterComponent,
    YardlyToastContainerComponent,
  ],
  template: `
    <yardly-toast-container></yardly-toast-container>
    <app-navbar></app-navbar>
    <router-outlet></router-outlet>
    <app-footer></app-footer>
  `,
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  private readonly authStore = inject(AuthStore);

  ngOnInit(): void {
    // Dacă există token în localStorage, restaurăm sesiunea prin GET /auth/me
    if (this.authStore.token()) {
      this.authStore.loadMe();
    }
  }
}
