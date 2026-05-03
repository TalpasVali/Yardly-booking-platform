import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <div class="coming-soon">
      <span class="material-symbols-outlined icon">settings</span>
      <h2>Settings</h2>
      <p>Configure platform settings, permissions and system parameters.</p>
    </div>
  `,
  styles: [`
    .coming-soon {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      gap: 1rem;
      color: var(--yardly-muted);
      font-family: 'Lexend', sans-serif;
      padding: 4rem;
      text-align: center;
    }
    .icon { font-size: 3rem; color: var(--yardly-accent); opacity: 0.5; }
    h2 { font-size: 1.25rem; font-weight: 700; color: var(--yardly-text); margin: 0; }
    p  { font-size: 0.875rem; margin: 0; max-width: 28rem; }
  `],
})
export class AdminSettingsComponent {}
