import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-field-editor',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './field-editor.component.html',
  styleUrls: ['./field-editor.component.scss'],
})
export class FieldEditorComponent {
  form: FormGroup;
  isDragging = false;
  uploadedImages: string[] = [];

  sportTypes = ['Soccer (5v5)', 'Soccer (7v7)', 'Soccer (11v11)', 'Basketball', 'Tennis', 'Padel', 'Volleyball', 'Badminton'];
  surfaceTypes = ['Artificial Grass (40)', 'Artificial Grass (60)', 'Natural Grass', 'Hard Court', 'Clay', 'Sand'];
  minBookingOptions = ['30 Minutes', '60 Minutes', '90 Minutes', '120 Minutes'];

  listingHealth = 80;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      displayName: ['', Validators.required],
      sportType: ['Soccer (5v5)'],
      surfaceType: ['Artificial Grass (40)'],
      hourlyRate: [0],
      minBooking: ['60 Minutes'],
    });
  }

  get previewName(): string {
    const val = this.form.get('displayName')?.value;
    return val?.trim() ? val : 'Sky High Soccer Arena Pitch 1';
  }

  onDragOver(e: DragEvent) {
    e.preventDefault();
    this.isDragging = true;
  }

  onDragLeave() {
    this.isDragging = false;
  }

  onDrop(e: DragEvent) {
    e.preventDefault();
    this.isDragging = false;
  }

  onDiscard() {
    this.form.reset({ sportType: 'Soccer (5v5)', surfaceType: 'Artificial Grass (40)', hourlyRate: 0, minBooking: '60 Minutes' });
  }

  onSaveDraft() { /* save draft logic */ }
  onPublish() { /* publish logic */ }
}
