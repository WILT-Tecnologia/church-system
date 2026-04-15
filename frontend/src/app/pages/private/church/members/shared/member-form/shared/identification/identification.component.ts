import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ColumnComponent } from '@app/components/column/column.component';
import { CivilStatus, ColorRace } from '@app/model/Auxiliaries';
import { Church } from '@app/model/Church';
import { Person } from '@app/model/Person';
import { ErrorMessagePipe } from '@app/pipes/error-message.pipe';
import { map, Observable, startWith } from 'rxjs';

@Component({
  selector: 'app-identification',
  templateUrl: './identification.component.html',
  styleUrl: './identification.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    ColumnComponent,
    ErrorMessagePipe,
  ],
})
export class IdentificationComponent implements OnInit {
  public readonly stepOneForm = input.required<FormGroup>();
  public readonly persons = input<Person[]>([]);
  public readonly churchs = input<Church[]>([]);
  public readonly civilStatus = input<CivilStatus[]>([]);
  public readonly colorRace = input<ColorRace[]>([]);
  public readonly searchControlPerson = input.required<FormControl>();
  public readonly searchControlChurch = input.required<FormControl>();
  public readonly searchControlCivilStatus = input.required<FormControl>();
  public readonly searchControlColorRace = input.required<FormControl>();

  public filteredPerson!: Observable<Person[]>;
  public filteredChurch!: Observable<Church[]>;
  public filteredCivilStatus!: Observable<CivilStatus[]>;
  public filteredColorRace!: Observable<ColorRace[]>;

  ngOnInit() {
    this.setupAutocomplete();
  }

  setupAutocomplete() {
    this.filteredPerson = this.searchControlPerson().valueChanges.pipe(
      startWith(''),
      map((value: Person | string) => (typeof value === 'string' ? value : value?.name || '')),
      map((name) => (name.length >= 1 ? this.filterPerson(name) : this.persons())),
    );

    this.filteredChurch = this.searchControlChurch().valueChanges.pipe(
      startWith(''),
      map((value: Church | string) => (typeof value === 'string' ? value : value?.name || '')),
      map((name) => (name.length >= 1 ? this.filterChurch(name) : this.churchs())),
    );

    this.filteredCivilStatus = this.searchControlCivilStatus().valueChanges.pipe(
      startWith(''),
      map((value: CivilStatus | string) => (typeof value === 'string' ? value : value?.name || '')),
      map((name) => (name.length >= 1 ? this.filterCivilStatus(name) : this.civilStatus())),
    );

    this.filteredColorRace = this.searchControlColorRace().valueChanges.pipe(
      startWith(''),
      map((value: ColorRace | string) => (typeof value === 'string' ? value : value?.name || '')),
      map((name) => (name.length >= 1 ? this.filterColorRace(name) : this.colorRace())),
    );
  }

  filterPerson(name: string): Person[] {
    return this.persons().filter((person) =>
      person.name.toLowerCase().includes(name.toLowerCase()),
    );
  }

  filterChurch(name: string): Church[] {
    return this.churchs().filter((church) =>
      church.name.toLowerCase().includes(name.toLowerCase()),
    );
  }

  filterCivilStatus(name: string): CivilStatus[] {
    return this.civilStatus().filter((option) =>
      option.name.toLowerCase().includes(name.toLowerCase()),
    );
  }

  filterColorRace(name: string): ColorRace[] {
    return this.colorRace().filter((colorRace) =>
      colorRace.name.toLowerCase().includes(name.toLowerCase()),
    );
  }

  onPersonSelected(event: MatAutocompleteSelectedEvent) {
    const selectedPerson = event.option.value;
    this.searchControlPerson().setValue(selectedPerson.name);
    this.stepOneForm().get('person_id')?.setValue(selectedPerson.id);
  }

  onChurchSelected(event: MatAutocompleteSelectedEvent) {
    const selectedChurch = event.option.value;
    this.searchControlChurch().setValue(selectedChurch.name);
    this.stepOneForm().get('church_id')?.setValue(selectedChurch.id);
  }

  onCivilStatusSelected(event: MatAutocompleteSelectedEvent) {
    const selectedCivilStatus = event.option.value;
    this.searchControlCivilStatus().setValue(selectedCivilStatus.name);
    this.stepOneForm().get('civil_status_id')?.setValue(selectedCivilStatus.id);
  }

  onColorRaceSelected(event: MatAutocompleteSelectedEvent) {
    const selectedColorRace = event.option.value;
    this.searchControlColorRace().setValue(selectedColorRace.name);
    this.stepOneForm().get('color_race_id')?.setValue(selectedColorRace.id);
  }
  showAllPerson() {
    this.filteredPerson = this.searchControlPerson().valueChanges.pipe(
      startWith(''),
      map((value: Person | string) => (typeof value === 'string' ? value : value?.name || '')),
      map((name) => (name.length >= 1 ? this.filterPerson(name) : this.persons())),
    );
  }

  showAllChurch() {
    this.filteredChurch = this.searchControlChurch().valueChanges.pipe(
      startWith(''),
      map((value: Church | string) => (typeof value === 'string' ? value : value?.name || '')),
      map((name) => (name.length >= 1 ? this.filterChurch(name) : this.churchs())),
    );
  }

  showAllCivilStatus() {
    this.filteredCivilStatus = this.searchControlCivilStatus().valueChanges.pipe(
      startWith(''),
      map((value: CivilStatus | string) => (typeof value === 'string' ? value : value?.name || '')),
      map((name) => (name.length >= 1 ? this.filterCivilStatus(name) : this.civilStatus())),
    );
  }

  showAllColorRace() {
    this.filteredColorRace = this.searchControlColorRace().valueChanges.pipe(
      startWith(''),
      map((value: ColorRace | string) => (typeof value === 'string' ? value : value?.name || '')),
      map((name) => (name.length >= 1 ? this.filterColorRace(name) : this.colorRace())),
    );
  }
}
