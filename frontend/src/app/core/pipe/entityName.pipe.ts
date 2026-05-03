import { Pipe, PipeTransform } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Pipe({
  name: 'entityName',
  pure: false, // Pentru că lucrezi cu store și vrei să se reactiveze
})
export class EntityNamePipe implements PipeTransform {
  private cache: { [key: string]: string } = {};

  constructor(private store: Store) {}

  transform(
    entityId: string,
    entityType: 'sport' | 'city' | 'facility'
  ): string {
    if (!entityId) return '';

    const cacheKey = `${entityType}-${entityId}`;
    if (this.cache[cacheKey]) {
      return this.cache[cacheKey];
    }

    let selector$!: Observable<any[]>;

    switch (entityType) {
      case 'sport':
        selector$ = this.store.select((state: any) =>
          state.sports.entities ? Object.values(state.sports.entities) : []
        );
        break;
      case 'city':
        selector$ = this.store.select((state: any) =>
          state.cities.entities
            ? Object.values(state.cities.entities)
            : state.cities.entities
        );
        break;
      default:
        return 'Necunoscut';
    }

    selector$
      .pipe(
        map((list) => {
          const entity = list.find((e) => e._id === entityId);
          const name = entity?.name || 'Necunoscut';
          this.cache[cacheKey] = name;
          return name;
        })
      )
      .subscribe();

    return this.cache[cacheKey] || '';
  }
}
