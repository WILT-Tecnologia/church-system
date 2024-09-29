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
import { ColumnComponent } from 'app/components/column/column.component';
import { ValidationService } from 'app/service/validation/validation.service';
import dayjs from 'dayjs';
import { LoadingService } from '../../../../../components/loading/loading.service';
import { Occupation } from '../../../../../model/Occupation';
import { SnackbarService } from '../../../../../service/snackbar/snackbar.service';
import { OccupationsService } from '../occupations.service';

@Component({
  selector: 'app-occupation',
  templateUrl: './occupation.component.html',
  styleUrls: ['./occupation.component.scss'],
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatDividerModule,
    MatIconModule,
    ColumnComponent,
    ReactiveFormsModule,
    CommonModule,
  ],
})
export class OccupationComponent implements OnInit {
  occupationForm: FormGroup;
  occupationId: string | null = null;
  isEditMode: boolean = false;

  constructor(
    private fb: FormBuilder,
    private loadingService: LoadingService,
    private snackbarService: SnackbarService,
    private occupationsService: OccupationsService,
    private validationService: ValidationService,
    private dialogRef: MatDialogRef<OccupationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { occupation: Occupation },
  ) {
    this.occupationForm = this.createForm();
  }

  ngOnInit() {
    if (this.data && this.data.occupation) {
      this.isEditMode = true;
      this.occupationId = this.data.occupation.id;
      this.occupationForm.patchValue(this.data.occupation);
      this.handleEditMode();
    }
  }

  get pageTitle() {
    return this.isEditMode ? 'Editando ocupação' : 'Criando ocupação';
  }

  getErrorMessage(controlName: string) {
    const control = this.occupationForm.get(controlName);
    return control ? this.validationService.getErrorMessage(control) : null;
  }

  createForm() {
    return this.fb.group({
      id: [this.data?.occupation?.id || ''],
      name: [
        this.data?.occupation?.name || '',
        [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(255),
        ],
      ],
      description: [
        this.data?.occupation?.description || '',
        [Validators.maxLength(255)],
      ],
      status: [this.data?.occupation?.status || true],
      updated_at: [this.data?.occupation?.updated_at || ''],
    });
  }

  handleBack = () => {
    this.dialogRef.close();
  };

  handleSubmit = () => {
    if (this.occupationForm.invalid) {
      return;
    }

    const occupationData = this.occupationForm.value;
    if (this.isEditMode) {
      this.updateOccupation(occupationData.id);
    } else {
      this.createOccupation();
    }
    this.dialogRef.close(occupationData);
  };

  createOccupation() {
    this.loadingService.show();
    this.occupationsService
      .createOccupation(this.occupationForm.value)
      .subscribe({
        next: () => {
          this.snackbarService.openSuccess('Ocupação criada com sucesso!');
          this.dialogRef.close(this.occupationForm.value);
        },
        error: () => {
          this.snackbarService.openError(
            'Erro ao criar a ocupação. Tente novamente!',
          );
          this.loadingService.hide();
        },
        complete: () => {
          this.loadingService.hide();
        },
      });
  }

  updateOccupation(occupationId: string) {
    this.loadingService.show();
    this.occupationsService
      .updateOccupation(occupationId!, this.occupationForm.value)
      .subscribe({
        next: () => {
          this.snackbarService.openSuccess('Ocupação atualizada com sucesso!');
          this.dialogRef.close(this.occupationForm.value);
        },
        error: () => {
          this.loadingService.hide();
          this.snackbarService.openError(
            'Erro ao atualizar a ocupação. Tente novamente!',
          );
        },
        complete: () => {
          this.loadingService.hide();
        },
      });
  }

  handleEditMode = () => {
    this.occupationsService
      .getOccupationById(this.occupationId!)
      .subscribe((occupation: Occupation) => {
        this.occupationForm.patchValue({
          ...occupation,
          updated_at: dayjs(occupation.updated_at).format(
            'DD/MM/YYYY [às] HH:mm:ss',
          ),
        });
      });
  };
}
