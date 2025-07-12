import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsEventComponent } from './details-event.component';

describe('DetailsEventComponent', () => {
  let component: DetailsEventComponent;
  let fixture: ComponentFixture<DetailsEventComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsEventComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailsEventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
