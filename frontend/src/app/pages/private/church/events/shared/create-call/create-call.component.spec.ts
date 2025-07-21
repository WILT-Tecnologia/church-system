import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateCallComponent } from './create-call.component';

describe('CreateCallComponent', () => {
  let component: CreateCallComponent;
  let fixture: ComponentFixture<CreateCallComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateCallComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateCallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
