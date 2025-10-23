import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModuleFormComponent } from './module-form.component';

describe('ModuleFormComponent', () => {
  let component: ModuleFormComponent;
  let fixture: ComponentFixture<ModuleFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModuleFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModuleFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
