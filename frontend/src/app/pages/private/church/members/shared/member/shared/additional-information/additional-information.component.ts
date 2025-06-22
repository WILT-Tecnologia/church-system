import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { ColumnComponent } from 'app/components/column/column.component';
import { Formations } from 'app/model/Auxiliaries';
import { ValidationService } from 'app/services/validation/validation.service';
import { map, Observable, startWith } from 'rxjs';

@Component({
  selector: 'app-additional-information',
  templateUrl: './additional-information.component.html',
  styleUrl: './additional-information.component.scss',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatRadioModule,
    MatCheckboxModule,
    ColumnComponent,
  ],
})
export class AdditionalInformationComponent implements OnInit {
  @Input() stepTwoForm!: FormGroup;
  @Input() formations: Formations[] = [];
  @Input() searchControlFormations!: FormControl;
  isFormationCourseVisible: boolean = false;
  formationsRequiringCourse: string[] = ['08', '09', '10', '11', '12'];
  filteredFormations: Observable<Formations[]> = new Observable<Formations[]>();

  constructor(
    private fb: FormBuilder,
    private validationService: ValidationService,
  ) {}

  ngOnInit() {
    this.initializeForm();
    this.setupAutocomplete();
    this.onFormationChange(this.stepTwoForm.get('formation_id')?.value, this.formations);
  }

  initializeForm = () => {
    if (!this.stepTwoForm) {
      this.stepTwoForm = this.fb.group({
        formation_id: ['', [Validators.required]],
        formation_course: ['', [Validators.maxLength(255)]],
        profission: ['', [Validators.maxLength(255)]],
        has_disability: [false],
        def_physical: [false],
        def_visual: [false],
        def_hearing: [false],
        def_intellectual: [false],
        def_mental: [false],
        def_multiple: [false],
        def_other: [false],
        def_other_description: ['', [Validators.maxLength(255)]],
      });
    }
  };

  setupAutocomplete() {
    this.filteredFormations = this.searchControlFormations.valueChanges.pipe(
      startWith(''),
      map((value: any) => (typeof value === 'string' ? value : value?.name || '')),
      map((name) => (name.length >= 1 ? this.filterFormations(name) : this.formations)),
    );
  }

  filterFormations(name: string): Formations[] {
    return this.formations.filter((formation) => formation.name.toLowerCase().includes(name.toLowerCase()));
  }

  onFormationsSelected(event: MatAutocompleteSelectedEvent) {
    const selectedFormations = event.option.value;
    this.searchControlFormations.setValue(selectedFormations.name);
    this.stepTwoForm.get('formation_id')?.setValue(selectedFormations.id);
    this.onFormationChange(selectedFormations.id, this.formations);
  }

  onFormationChange(selectedFormationId: string, formations: Formations[]) {
    const selectedFormation = formations.find((f) => f.id === selectedFormationId);
    const formationCourseControl = this.stepTwoForm.get('formation_course');

    if (selectedFormation && this.formationsRequiringCourse.includes(selectedFormation.codigo)) {
      this.isFormationCourseVisible = true;
      formationCourseControl?.setValidators(Validators.required);
    } else {
      this.isFormationCourseVisible = false;
      formationCourseControl?.clearValidators();
    }

    formationCourseControl?.updateValueAndValidity();
  }

  getErrorMessage(controlName: string) {
    const control = this.stepTwoForm.get(controlName);
    return control?.errors ? this.validationService.getErrorMessage(control) : null;
  }

  showAllFormations() {
    this.filteredFormations = this.searchControlFormations.valueChanges.pipe(
      startWith(''),
      map((value: any) => (typeof value === 'string' ? value : value?.name || '')),
      map((name) => (name.length >= 1 ? this.filterFormations(name) : this.formations)),
    );
  }
}
