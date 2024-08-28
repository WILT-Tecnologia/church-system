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
import { Occupation } from '../../../../../model/Occupation';
import { CoreService } from '../../../../../service/core/core.service';
import { SnackbarService } from '../../../../../service/snackbar/snackbar.service';
import { OccupationsService } from '../occupations.service';

@Component({
  selector: 'app-occupation',
  standalone: true,
  templateUrl: './occupation.component.html',
  styleUrls: ['./occupation.component.scss'],
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
export class OccupationComponent implements OnInit {
  occupationForm: FormGroup;
  isEditMode: boolean = false;
  occupationId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private core: CoreService,
    private route: ActivatedRoute,
    private loadingService: LoadingService,
    private snackbarService: SnackbarService,
    private occupationsService: OccupationsService
  ) {
    this.occupationForm = this.fb.group({
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
    this.occupationId = this.route.snapshot.paramMap.get('id');
    if (this.occupationId) {
      this.isEditMode = true;
      this.handleEditMode();
    }
  }

  get pageTitle() {
    return this.isEditMode ? 'Editar ocupação' : 'Criar ocupação';
  }

  handleBack = () => {
    this.core.handleBack();
  };

  handleSubmit = () => {
    if (this.occupationForm.invalid) {
      return;
    }

    if (this.isEditMode) {
      this.updateOccupation();
    } else {
      this.createOccupation();
    }
  };

  createOccupation = () => {
    this.loadingService.show();
    this.occupationsService
      .createOccupation(this.occupationForm.value)
      .subscribe({
        next: () => {
          this.snackbarService.openSuccess('Ocupação criado com sucesso!');
          this.core.handleBack();
        },
        error: () => {
          this.snackbarService.openError(
            `Erro ao criar a ocupação ${
              this.occupationForm.get('name')?.value
            }. Tente novamente mais tarde!`
          );
          this.loadingService.hide();
        },
        complete: () => {
          this.loadingService.hide();
        },
      });
  };

  handleEditMode() {
    this.loadingService.show();
    this.occupationsService
      .getOccupationById(this.occupationId!)
      .subscribe((occupation: Occupation) => {
        const formattedUpdatedAt = dayjs(occupation.updated_at).format(
          'DD/MM/YYYY [às] HH:mm:ss'
        );
        this.occupationForm.patchValue({
          ...occupation,
          updated_at: formattedUpdatedAt,
        });
        this.loadingService.hide();
      });
    this.loadingService.hide();
  }

  updateOccupation = () => {
    this.loadingService.show();
    this.occupationsService
      .updateOccupation(this.occupationId!, this.occupationForm.value)
      .subscribe({
        next: () => {
          this.snackbarService.openSuccess('Ocupação atualizada com sucesso!');
          this.core.handleBack();
        },
        error: () => {
          this.snackbarService.openError(
            `Erro ao atualizar a ocupação ${
              this.occupationForm.get('name')?.value
            }. Tente novamente mais tarde!`
          );
          this.loadingService.hide();
        },
        complete: () => {
          this.loadingService.hide();
        },
      });
  };
}
