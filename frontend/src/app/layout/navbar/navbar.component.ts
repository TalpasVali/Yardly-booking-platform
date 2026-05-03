import { ChangeDetectionStrategy, Component, HostListener, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthFacade } from '../../features/auth/facades/auth.facade';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  protected readonly authFacade   = inject(AuthFacade);
  protected readonly themeService = inject(ThemeService);

  readonly isScrolled       = signal(false);
  readonly mobileMenuActive = signal(false);

  @HostListener('window:scroll')
  onWindowScroll() {
    this.isScrolled.set(window.scrollY > 50);
  }

  @HostListener('window:resize')
  onResize() {
    if (window.innerWidth > 768) {
      this.mobileMenuActive.set(false);
    }
  }

  toggleMobileMenu() {
    this.mobileMenuActive.update(v => !v);
  }

  logout() {
    this.authFacade.logout();
    this.mobileMenuActive.set(false);
  }
}
