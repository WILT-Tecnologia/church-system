import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { ColumnComponent } from '@app/components/column/column.component';
import { Formations } from '@app/model/Auxiliaries';
import { ErrorMessagePipe } from '@app/pipes/error-message.pipe';
import { ValidationService } from '@app/services/validation/validation.service';
import { map, Observable, startWith } from 'rxjs';

@Component({
  selector: 'app-additional-information',
  templateUrl: './additional-information.component.html',
  styleUrl: './additional-information.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
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
    ErrorMessagePipe,
  ],
})
export class AdditionalInformationComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly validationService = inject(ValidationService);

  public readonly stepTwoForm = input.required<FormGroup>();
  public readonly formations = input<Formations[]>([]);
  public readonly searchControlFormations = input.required<FormControl>();

  public isFormationCourseVisible = false;
  private readonly formationsRequiringCourse = ['08', '09', '10', '11', '12'];
  public filteredFormations!: Observable<Formations[]>;

  ngOnInit() {
    this.setupAutocomplete();
    this.onFormationChange(this.stepTwoForm().get('formation_id')?.value, this.formations());
    this.setupDefOtherConditionalValidation();
    this.setupHasDisabilityListener();
  }

  setupAutocomplete() {
    this.filteredFormations = this.searchControlFormations().valueChanges.pipe(
      startWith(''),
      map((value: any) => (typeof value === 'string' ? value : value?.name || '')),
      map((name) => (name.length >= 1 ? this.filterFormations(name) : this.formations())),
    );
  }

  filterFormations(name: string): Formations[] {
    return this.formations().filter((formation) =>
      formation.name.toLowerCase().includes(name.toLowerCase()),
    );
  }

  onFormationsSelected(event: MatAutocompleteSelectedEvent) {
    const selectedFormations = event.option.value;
    this.searchControlFormations().setValue(selectedFormations.name);
    this.stepTwoForm().get('formation_id')?.setValue(selectedFormations.id);
    this.onFormationChange(selectedFormations.id, this.formations());
  }

  onFormationChange(selectedFormationId: string, formations: Formations[]) {
    const selectedFormation = formations.find((f) => f.id === selectedFormationId);
    const formationCourseControl = this.stepTwoForm().get('formation_course');

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
    const control = this.stepTwoForm().get(controlName);
    return control?.errors ? this.validationService.getErrorMessage(control) : null;
  }

  showAllFormations() {
    this.filteredFormations = this.searchControlFormations().valueChanges.pipe(
      startWith(''),
      map((value: any) => (typeof value === 'string' ? value : value?.name || '')),
      map((name) => (name.length >= 1 ? this.filterFormations(name) : this.formations())),
    );
  }

  private setupDefOtherConditionalValidation() {
    const defOtherControl = this.stepTwoForm().get('def_other');
    const defOtherDescControl = this.stepTwoForm().get('def_other_description');

    defOtherControl?.valueChanges.subscribe((value: boolean) => {
      if (value) {
        defOtherDescControl?.setValidators([Validators.required, Validators.maxLength(255)]);
      } else {
        defOtherDescControl?.clearValidators();
        defOtherDescControl?.setValue('');
      }
      defOtherDescControl?.updateValueAndValidity();
    });

    if (defOtherControl?.value) {
      defOtherDescControl?.setValidators([Validators.required, Validators.maxLength(255)]);
      defOtherDescControl?.updateValueAndValidity();
    }
  }

  private setupHasDisabilityListener() {
    const hasDisabilityControl = this.stepTwoForm().get('has_disability');
    const disabilityFields = [
      'def_physical',
      'def_visual',
      'def_hearing',
      'def_intellectual',
      'def_mental',
      'def_multiple',
      'def_other',
      'def_other_description',
    ];

    hasDisabilityControl?.valueChanges.subscribe((hasDisability: boolean) => {
      if (!hasDisability) {
        disabilityFields.forEach((field) => {
          const control = this.stepTwoForm().get(field);
          if (control) {
            const defaultValue = field === 'def_other_description' ? '' : false;
            control.setValue(defaultValue, { emitEvent: false });
            control.clearValidators();
            control.updateValueAndValidity({ emitEvent: false });
          }
        });
      }
    });
  }
}
