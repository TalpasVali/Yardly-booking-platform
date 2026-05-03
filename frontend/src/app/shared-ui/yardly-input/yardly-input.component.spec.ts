import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YardlyInputComponent } from './yardly-input.component';

describe('YardlyInputComponent', () => {
  let component: YardlyInputComponent;
  let fixture: ComponentFixture<YardlyInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [YardlyInputComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(YardlyInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
