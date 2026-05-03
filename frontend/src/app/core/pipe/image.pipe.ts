import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../../enviroments/enviroment';

@Pipe({
  name: 'imageUrl',
  standalone: true
})
export class ImageUrlPipe implements PipeTransform {
  transform(imagePath: string): string {
    if (!imagePath) {
      return ''; // fallback dacă nu există imagine
    }
    return `${environment.apiUrl}${imagePath}`;
  }
}