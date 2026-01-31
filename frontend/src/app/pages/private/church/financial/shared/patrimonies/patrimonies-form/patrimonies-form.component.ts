import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { map, Observable, startWith } from 'rxjs';

import { ActionsComponent } from 'app/components/actions/actions.component';
import { ColumnComponent } from 'app/components/column/column.component';
import { LoadingService } from 'app/components/loading/loading.service';
import { MESSAGES } from 'app/components/toast/messages';
import { Church } from 'app/model/Church';
import { Patrimonies } from 'app/model/Patrimonies';
import { ChurchsService } from 'app/pages/private/administrative/churches/churches.service';
import { NotificationService } from 'app/services/notification/notification.service';
import { ValidationService } from 'app/services/validation/validation.service';
import { PatrimoniesService } from '../patrimonies.service';

@Component({
  selector: 'app-patrimonies-form',
  templateUrl: './patrimonies-form.component.html',
  styleUrl: './patrimonies-form.component.scss',
  imports: [
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatDividerModule,
    ReactiveFormsModule,
    CommonModule,
    ColumnComponent,
    ActionsComponent,
  ],
})
export class PatrimoniesFormComponent implements OnInit {
  constructor() {}

  private readonly fb = inject(FormBuilder);
  private readonly loading = inject(LoadingService);
  private readonly validationService = inject(ValidationService);
  private readonly notification = inject(NotificationService);
  private readonly churchsService = inject(ChurchsService);
  private readonly patrimoniesService = inject(PatrimoniesService);
  private readonly dialogRef = inject(MatDialogRef<PatrimoniesFormComponent>);
  private readonly data = inject(MAT_DIALOG_DATA);

  patrimoniesForm!: FormGroup;
  searchControlChurch = new FormControl('');
  churchs: Church[] = [];
  filteredChurch: Observable<Church[]> = new Observable<Church[]>();
  isEditMode: boolean = false;

  ngOnInit() {
    this.patrimoniesForm = this.createForm();
    this.checkEditMode();
    this.loadChurchs();
  }

  createForm(): FormGroup {
    const patrimonies = this.data?.patrimonies || this.data;

    return this.fb.group({
      id: [patrimonies?.id ?? ''],
      church_id: [patrimonies?.church_id ?? '', [Validators.required]],
      name: [patrimonies?.name ?? '', [Validators.required, Validators.maxLength(255)]],
      number: [patrimonies?.number ?? '', [Validators.required]],
      description: [patrimonies?.description ?? '', [Validators.maxLength(255)]],
    });
  }

  private loadChurchs() {
    this.loading.show();
    this.churchsService.getChurch().subscribe({
      next: (churchs: Church[]) => {
        this.churchs = churchs;
        this.setupAutocomplete();

        if (this.isEditMode && this.data.patrimonies.church_id) {
          const currentChurch = this.churchs.find((c) => c.id === this.data.patrimonies.church_id);
          if (currentChurch) {
            this.searchControlChurch.setValue(currentChurch.name, { emitEvent: false });
          }
        }
      },
      error: () => this.notification.onError(MESSAGES.LOADING_ERROR),
      complete: () => this.loading.hide(),
    });
  }

  private setupAutocomplete() {
    this.filteredChurch = this.searchControlChurch.valueChanges.pipe(
      startWith(''),
      map((value: string | Church | null) => {
        // Garante que estamos filtrando por string, mesmo que o valor seja o objeto Church
        const name = typeof value === 'string' ? value : value && 'name' in value ? value.name : '';
        return name ? this.filterChurch(name) : this.churchs.slice();
      }),
    );
  }

  private filterChurch(name: string): Church[] {
    return this.churchs.filter((church) => church.name.toLowerCase().includes(name.toLowerCase()));
  }

  onChurchSelected(event: MatAutocompleteSelectedEvent) {
    const selectedChurch = event.option.value;
    this.searchControlChurch.setValue(selectedChurch.name);
    this.patrimoniesForm.get('church_id')?.setValue(selectedChurch.id);
  }

  showAllChurch() {
    this.setupAutocomplete();
  }

  checkEditMode() {
    if (this.data?.patrimonies?.id) {
      this.isEditMode = true;
    }
  }

  getErrorMessage(controlName: string): string | null {
    const control = this.patrimoniesForm.get(controlName);
    return control?.errors ? this.validationService.getErrorMessage(control) : null;
  }

  handleCancel() {
    this.dialogRef?.close();
  }

  handleSubmit() {
    this.patrimoniesForm.markAllAsTouched();

    if (this.patrimoniesForm.invalid) return;

    if (this.isEditMode) {
      this.handleUpdate(this.data?.patrimonies?.id, this.patrimoniesForm.value);
    } else {
      this.handleCreate(this.patrimoniesForm.value);
    }
  }

  handleCreate(data: Patrimonies) {
    this.loading.show();
    this.patrimoniesService.create(data).subscribe({
      next: (guest) => {
        this.notification.onSuccess(MESSAGES.CREATE_SUCCESS);
        this.dialogRef?.close(guest);
      },
      error: (err) => this.notification.onError(err.error.message ?? MESSAGES.CREATE_ERROR),
      complete: () => this.loading.hide(),
    });
  }

  handleUpdate(id: string, data: Patrimonies) {
    this.loading.show();
    this.patrimoniesService.update(id, data).subscribe({
      next: (guest) => {
        this.loading.hide();
        this.notification.onSuccess(MESSAGES.UPDATE_SUCCESS);
        this.dialogRef?.close(guest);
      },
      error: (err) => this.notification.onError(err.error.message ?? MESSAGES.UPDATE_ERROR),
      complete: () => this.loading.hide(),
    });
  }
}
