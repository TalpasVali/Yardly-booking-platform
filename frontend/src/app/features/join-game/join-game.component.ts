import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface Player {
  id: number;
  name: string;
  avatarUrl: string;
}

@Component({
  selector: 'app-join-game',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterModule],
  templateUrl: './join-game.component.html',
  styleUrl: './join-game.component.scss',
})
export class JoinGameComponent {
  game = {
    title: 'Friday Night Football',
    venue: 'Central Park Field A',
    timeStart: '7:00 PM',
    timeEnd: '9:00 PM',
    sport: 'Soccer',
    intensity: 'Intermediate',
    pricePerPlayer: 12,
    badge: 'PREMIUM FIELD',
  };

  players: Player[] = [
    { id: 1, name: 'Alex',   avatarUrl: 'https://i.pravatar.cc/48?img=1' },
    { id: 2, name: 'Jordan', avatarUrl: 'https://i.pravatar.cc/48?img=2' },
    { id: 3, name: 'Morgan', avatarUrl: 'https://i.pravatar.cc/48?img=3' },
    { id: 4, name: 'Taylor', avatarUrl: 'https://i.pravatar.cc/48?img=4' },
    { id: 5, name: 'Casey',  avatarUrl: 'https://i.pravatar.cc/48?img=5' },
    { id: 6, name: 'Jamie',  avatarUrl: 'https://i.pravatar.cc/48?img=6' },
    { id: 7, name: 'Sam',    avatarUrl: 'https://i.pravatar.cc/48?img=7' },
  ];

  maxPlayers = 10;
  shareLink  = 'yardly.gg/g/r-1-303';
  copied     = false;
  fullName   = '';
  email      = '';
  joining    = false;
  joined     = false;

  // Used to render map grid cells
  readonly mapGrid = Array.from({ length: 24 }, (_, i) => i);

  get joinedCount(): number  { return this.players.length; }
  get spotsLeft(): number    { return this.maxPlayers - this.joinedCount; }
  get progressPercent(): number { return Math.round((this.joinedCount / this.maxPlayers) * 100); }

  joinMatch(): void {
    if (!this.fullName || !this.email) return;
    this.joining = true;
    setTimeout(() => { this.joining = false; this.joined = true; }, 1200);
  }

  copyLink(): void {
    navigator.clipboard.writeText(this.shareLink).catch(() => {});
    this.copied = true;
    setTimeout(() => (this.copied = false), 2000);
  }

  shareEmail(): void {
    window.location.href = `mailto:?subject=Join%20Friday%20Night%20Football&body=Secure%20your%20spot%3A%20${encodeURIComponent(this.shareLink)}`;
  }

  shareMessage(): void {
    window.open(`sms:?body=Join%20us%3A%20${encodeURIComponent(this.shareLink)}`, '_blank');
  }

  showQR(): void { /* placeholder */ }

  viewMap(): void {
    window.open('https://maps.google.com', '_blank');
  }
}
