import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ActivatedRoute } from '@angular/router';
import { EventTypes } from 'app/model/EventTypes';
import { ValidationService } from 'app/service/validation/validation.service';
import dayjs from 'dayjs';
import { ColumnComponent } from '../../../../../components/column/column.component';
import { LoadingService } from '../../../../../components/loading/loading.service';
import { CoreService } from '../../../../../service/core/core.service';
import { SnackbarService } from '../../../../../service/snackbar/snackbar.service';
import { EventTypesService } from '../eventTypes.service';

@Component({
  selector: 'app-eventType',
  standalone: true,
  templateUrl: './eventType.component.html',
  styleUrls: ['./eventType.component.scss'],
  imports: [
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatDividerModule,
    MatIconModule,
    ReactiveFormsModule,
    CommonModule,
    ColumnComponent,
  ],
})
export class EventTypeComponent implements OnInit {
  eventTypeForm: FormGroup;
  isEditMode: boolean = false;
  eventTypeId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private core: CoreService,
    private route: ActivatedRoute,
    private eventTypesService: EventTypesService,
    private snackbarService: SnackbarService,
    private loadingService: LoadingService,
    private validationService: ValidationService,
    private dialogRef: MatDialogRef<EventTypeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { eventType: EventTypes },
  ) {
    this.eventTypeForm = this.createForm();
  }

  ngOnInit() {
    if (this.data && this.data.eventType) {
      this.isEditMode = true;
      this.eventTypeId = this.data.eventType.id;
      this.eventTypeForm.patchValue(this.data.eventType);
      this.handleEditMode();
    }
  }

  createForm = () => {
    return (this.eventTypeForm = this.fb.group({
      id: [this.data?.eventType?.id || ''],
      name: [
        this.data?.eventType?.name || '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(255),
        ],
      ],
      description: [
        this.data?.eventType?.description || '',
        [Validators.maxLength(255)],
      ],
      status: [this.data?.eventType?.status || true],
      updated_at: [this.data?.eventType?.updated_at || ''],
    }));
  };

  get pageTitle() {
    return this.isEditMode
      ? 'Editando tipo de evento'
      : 'Criando tipo de evento';
  }

  getErrorMessage(controlName: string) {
    const control = this.eventTypeForm.get(controlName);
    return control ? this.validationService.getErrorMessage(control) : null;
  }

  handleSubmit = () => {
    if (this.eventTypeForm.invalid) {
      return;
    }

    const eventTypeData = this.eventTypeForm.value;
    if (this.isEditMode) {
      this.handleUpdate(eventTypeData.id);
    } else {
      this.handleCreate();
    }
  };

  handleBack = () => {
    this.dialogRef.close();
  };

  handleCreate = () => {
    this.loadingService.show();
    this.eventTypesService
      .createEventTypes(this.eventTypeForm.value)
      .subscribe({
        next: () => {
          this.snackbarService.openSuccess(
            'Tipo de evento criado com sucesso.',
          );
          this.dialogRef.close(this.eventTypeForm.value);
        },
        error: (error) => {
          this.loadingService.hide();
          this.snackbarService.openError(error.error.message);
        },
        complete: () => this.loadingService.hide(),
      });
  };

  handleEditMode = () => {
    this.eventTypesService
      .getEventTypesById(this.eventTypeId!)
      .subscribe((eventType: EventTypes) => {
        this.eventTypeForm.patchValue({
          ...eventType,
          updated_at: dayjs(eventType.updated_at).format(
            'DD/MM/YYYY [às] HH:mm:ss',
          ),
        });
      });
  };

  handleUpdate = (eventTypeId: string) => {
    this.loadingService.show();
    this.eventTypesService
      .updateEventTypes(eventTypeId!, this.eventTypeForm.value)
      .subscribe({
        next: () => {
          this.snackbarService.openSuccess(
            'Tipo de evento atualizado com sucesso.',
          );
          this.dialogRef.close(this.eventTypeForm.value);
        },
        error: () => {
          this.loadingService.hide();
          this.snackbarService.openError('Erro ao atualizar o tipo de evento.');
        },
        complete: () => this.loadingService.hide(),
      });
  };
}
