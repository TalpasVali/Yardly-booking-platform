import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YardlyToastComponent } from './yardly-toast.component';

describe('YardlyToastComponent', () => {
  let component: YardlyToastComponent;
  let fixture: ComponentFixture<YardlyToastComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [YardlyToastComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(YardlyToastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
