import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewCallComponent } from './new-call.component';

describe('NewCallComponent', () => {
  let component: NewCallComponent;
  let fixture: ComponentFixture<NewCallComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewCallComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewCallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
