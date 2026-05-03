import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YardlyToastContainerComponent } from './yardly-toast-container.component';

describe('YardlyToastContainerComponent', () => {
  let component: YardlyToastContainerComponent;
  let fixture: ComponentFixture<YardlyToastContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [YardlyToastContainerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(YardlyToastContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
