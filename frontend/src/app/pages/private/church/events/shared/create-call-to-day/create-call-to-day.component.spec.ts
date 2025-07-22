import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateCallToDayComponent } from './create-call-to-day.component';

describe('CreateCallToDayComponent', () => {
  let component: CreateCallToDayComponent;
  let fixture: ComponentFixture<CreateCallToDayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateCallToDayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateCallToDayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
