import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  SimpleChanges,
} from '@angular/core';

import { Option } from '../../core/interface/option.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-yardly-input',
  imports: [CommonModule],
  templateUrl: './yardly-input.component.html',
  styleUrl: './yardly-input.component.scss',
})
export class YardlyInputComponent {
  @Input() options: Option[] = [];
  @Input() value: string = '';
  @Input() placeholder: string = 'Selectați o opțiune...';
  @Input() searchable: boolean = true;
  @Input() disabled: boolean = false;
  @Input() label: string = '';
  @Input() error: string = '';

  @Output() valueChange = new EventEmitter<string>();

  isOpen = false;
  searchTerm = '';
  filteredOptions: Option[] = [];
  selectedOption: Option | null = null;

  constructor(private eRef: ElementRef) {}

  ngOnInit() {
    this.filteredOptions = this.options;
    this.selectedOption =
      this.options.find((opt) => opt.value === this.value) || null;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['options']) {
      this.filteredOptions = this.options;
    }
  }

  toggleDropdown() {
    if (this.disabled) return;
    this.isOpen = !this.isOpen;
    if (!this.isOpen) {
      this.searchTerm = '';
      this.filteredOptions = this.options;
    }
  }

  selectOption(option: Option) {
    if (option.disabled) return;
    this.selectedOption = option;
    this.valueChange.emit(option.value);
    this.isOpen = false;
    this.searchTerm = '';
    this.filteredOptions = this.options;
  }

  onSearchChange(event: any) {
    this.searchTerm = event.target.value;
    this.filteredOptions = this.options.filter((opt) =>
      opt.label.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
      this.searchTerm = '';
      this.filteredOptions = this.options;
    }
  }
}
