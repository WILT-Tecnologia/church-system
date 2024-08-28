import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ActivatedRoute } from '@angular/router';
import dayjs from 'dayjs';
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
    private loadingService: LoadingService
  ) {
    this.eventTypeForm = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(255),
        ],
      ],
      description: ['', [Validators.maxLength(255)]],
      status: [true],
      updated_at: [''],
    });
  }

  ngOnInit() {
    this.eventTypeId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.eventTypeId;

    if (this.eventTypeId) {
      this.editEventType();
    }
  }

  get pageTitle() {
    return this.isEditMode ? 'Editar tipo de evento' : 'Criar tipo de evento';
  }

  handleSubmit = () => {
    if (this.eventTypeForm.invalid) {
      return;
    }

    if (this.isEditMode) {
      this.updateEventType();
    } else {
      this.createEventType();
    }
  };

  handleBack = () => {
    this.core.handleBack();
  };

  createEventType = () => {
    this.loadingService.show();
    this.eventTypesService
      .createEventTypes(this.eventTypeForm.value)
      .subscribe({
        next: () => {
          this.loadingService.hide();
          this.snackbarService.openSuccess(
            'Tipo de evento criado com sucesso.'
          );
          this.core.handleBack();
        },
        error: (error) => {
          this.loadingService.hide();
          this.snackbarService.openError(error.error.message);
        },
      });
  };

  editEventType = () => {
    this.loadingService.show();
    this.eventTypesService
      .getEventTypesById(this.eventTypeId!)
      .subscribe((eventType) => {
        const formattedUpdatedAt = dayjs(eventType.updated_at).format(
          'DD/MM/YYYY [às] HH:mm'
        );
        this.eventTypeForm.patchValue({
          ...eventType,
          updated_at: formattedUpdatedAt,
        });
        this.loadingService.hide();
      });
    this.loadingService.hide();
  };

  updateEventType = () => {
    this.loadingService.show();
    this.eventTypesService
      .updateEventTypes(this.eventTypeId!, this.eventTypeForm.value)
      .subscribe({
        next: () => {
          this.loadingService.hide();
          this.snackbarService.openSuccess(
            'Tipo de evento atualizado com sucesso.'
          );
          this.core.handleBack();
        },
        error: (error) => {
          this.loadingService.hide();
          this.snackbarService.openError(error.error.message);
        },
      });
  };
}
