import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { map, Observable, startWith } from 'rxjs';

import { ColumnComponent } from 'app/components/column/column.component';
import { CivilStatus, ColorRace } from 'app/model/Auxiliaries';
import { Church } from 'app/model/Church';
import { Person } from 'app/model/Person';
import { ValidationService } from 'app/services/validation/validation.service';

@Component({
  selector: 'app-identification',
  templateUrl: './identification.component.html',
  styleUrl: './identification.component.scss',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    ColumnComponent,
  ],
})
export class IdentificationComponent implements OnInit {
  @Input() stepOneForm!: FormGroup;
  @Input() persons: Person[] = [];
  @Input() churchs: Church[] = [];
  @Input() civilStatus: CivilStatus[] = [];
  @Input() colorRace: ColorRace[] = [];
  @Input() searchControlPerson!: FormControl;
  @Input() searchControlChurch!: FormControl;
  @Input() searchControlCivilStatus!: FormControl;
  @Input() searchControlColorRace!: FormControl;

  filteredPerson: Observable<Person[]> = new Observable<Person[]>();
  filteredChurch: Observable<Church[]> = new Observable<Church[]>();
  filteredCivilStatus: Observable<CivilStatus[]> = new Observable<CivilStatus[]>();
  filteredColorRace: Observable<ColorRace[]> = new Observable<ColorRace[]>();

  constructor(private validationService: ValidationService) {}

  ngOnInit() {
    this.initializeForm();
    this.setupAutocomplete();
  }

  initializeForm() {
    if (!this.stepOneForm) {
      this.stepOneForm = new FormGroup({
        id: new FormControl(''),
        person_id: new FormControl('', [Validators.required]),
        church_id: new FormControl('', [Validators.required]),
        rg: new FormControl('', [Validators.required, Validators.maxLength(15)]),
        issuing_body: new FormControl('', [Validators.required, Validators.maxLength(255)]),
        civil_status_id: new FormControl('', [Validators.required]),
        color_race_id: new FormControl('', [Validators.required]),
        nationality: new FormControl('', [Validators.required]),
        naturalness: new FormControl('', [Validators.required]),
      });
    }
  }

  setupAutocomplete() {
    this.filteredPerson = this.searchControlPerson.valueChanges.pipe(
      startWith(''),
      map((value: Person | string) => (typeof value === 'string' ? value : value?.name || '')),
      map((name) => (name.length >= 1 ? this.filterPerson(name) : this.persons)),
    );

    this.filteredChurch = this.searchControlChurch.valueChanges.pipe(
      startWith(''),
      map((value: Church | string) => (typeof value === 'string' ? value : value?.name || '')),
      map((name) => (name.length >= 1 ? this.filterChurch(name) : this.churchs)),
    );

    this.filteredCivilStatus = this.searchControlCivilStatus.valueChanges.pipe(
      startWith(''),
      map((value: CivilStatus | string) => (typeof value === 'string' ? value : value?.name || '')),
      map((name) => (name.length >= 1 ? this.filterCivilStatus(name) : this.civilStatus)),
    );

    this.filteredColorRace = this.searchControlColorRace.valueChanges.pipe(
      startWith(''),
      map((value: ColorRace | string) => (typeof value === 'string' ? value : value?.name || '')),
      map((name) => (name.length >= 1 ? this.filterColorRace(name) : this.colorRace)),
    );
  }

  filterPerson(name: string): Person[] {
    return this.persons.filter((person) => person.name.toLowerCase().includes(name.toLowerCase()));
  }

  filterChurch(name: string): Church[] {
    return this.churchs.filter((church) => church.name.toLowerCase().includes(name.toLowerCase()));
  }

  filterCivilStatus(name: string): CivilStatus[] {
    return this.civilStatus.filter((option) => option.name.toLowerCase().includes(name.toLowerCase()));
  }

  filterColorRace(name: string): ColorRace[] {
    return this.colorRace.filter((colorRace) => colorRace.name.toLowerCase().includes(name.toLowerCase()));
  }

  onPersonSelected(event: MatAutocompleteSelectedEvent) {
    const selectedPerson = event.option.value;
    this.searchControlPerson.setValue(selectedPerson.name);
    this.stepOneForm.get('person_id')?.setValue(selectedPerson.id);
  }

  onChurchSelected(event: MatAutocompleteSelectedEvent) {
    const selectedChurch = event.option.value;
    this.searchControlChurch.setValue(selectedChurch.name);
    this.stepOneForm.get('church_id')?.setValue(selectedChurch.id);
  }

  onCivilStatusSelected(event: MatAutocompleteSelectedEvent) {
    const selectedCivilStatus = event.option.value;
    this.searchControlCivilStatus.setValue(selectedCivilStatus.name);
    this.stepOneForm.get('civil_status_id')?.setValue(selectedCivilStatus.id);
  }

  onColorRaceSelected(event: MatAutocompleteSelectedEvent) {
    const selectedColorRace = event.option.value;
    this.searchControlColorRace.setValue(selectedColorRace.name);
    this.stepOneForm.get('color_race_id')?.setValue(selectedColorRace.id);
  }

  getErrorMessage(controlName: string) {
    const control = this.stepOneForm.get(controlName);
    return control?.errors ? this.validationService.getErrorMessage(control) : null;
  }

  showAllPerson() {
    this.filteredPerson = this.searchControlPerson.valueChanges.pipe(
      startWith(''),
      map((value: Person | string) => (typeof value === 'string' ? value : value?.name || '')),
      map((name) => (name.length >= 1 ? this.filterPerson(name) : this.persons)),
    );
  }

  showAllChurch() {
    this.filteredChurch = this.searchControlChurch.valueChanges.pipe(
      startWith(''),
      map((value: Church | string) => (typeof value === 'string' ? value : value?.name || '')),
      map((name) => (name.length >= 1 ? this.filterChurch(name) : this.churchs)),
    );
  }

  showAllCivilStatus() {
    this.filteredCivilStatus = this.searchControlCivilStatus.valueChanges.pipe(
      startWith(''),
      map((value: CivilStatus | string) => (typeof value === 'string' ? value : value?.name || '')),
      map((name) => (name.length >= 1 ? this.filterCivilStatus(name) : this.civilStatus)),
    );
  }

  showAllColorRace() {
    this.filteredColorRace = this.searchControlColorRace.valueChanges.pipe(
      startWith(''),
      map((value: ColorRace | string) => (typeof value === 'string' ? value : value?.name || '')),
      map((name) => (name.length >= 1 ? this.filterColorRace(name) : this.colorRace)),
    );
  }
}
