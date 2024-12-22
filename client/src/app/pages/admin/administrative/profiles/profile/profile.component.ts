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
import { LoadingService } from 'app/components/loading/loading.service';
import { ToastService } from 'app/components/toast/toast.service';
import { Profile } from 'app/model/Profile';
import dayjs from 'dayjs';

import { ActionsComponent } from 'app/components/actions/actions.component';
import { ValidationService } from 'app/utils/validation/validation.service';
import { ProfilesService } from '../profiles.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
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
    ActionsComponent,
  ],
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  isEditMode: boolean = false;
  profileId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private validation: ValidationService,
    private loading: LoadingService,
    private toast: ToastService,
    private profilesService: ProfilesService,
  ) {
    this.profileForm = this.fb.group({
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
    this.isEditMode = !!this.profileId;
    if (this.isEditMode) {
      this.handleEditMode();
    }
  }

  getErrorMessage(controlName: string) {
    const control = this.profileForm.get(controlName);
    return control ? this.validation.getErrorMessage(control) : null;
  }

  get pageTitle() {
    return this.isEditMode ? 'Editar perfil' : 'Criar perfil';
  }

  handleBack = () => {
    window.history.back();
  };

  handleSubmit = () => {
    if (this.profileForm.invalid) {
      return;
    }

    if (this.isEditMode) {
      this.updateProfile();
    } else {
      this.createProfile();
    }
  };

  createProfile = () => {
    this.loading.show();
    this.profilesService.createProfile(this.profileForm.value).subscribe({
      next: () => {
        this.loading.hide();
        this.toast.openSuccess('Perfil criado com sucesso!');
      },
      error: () => {
        this.loading.hide();
        this.toast.openError(
          `Erro ao criar o perfil ${
            this.profileForm.get('name')?.value
          }. Tente novamente mais tarde!`,
        );
      },
    });
  };

  handleEditMode = () => {
    this.loading.show();
    this.profilesService
      .getProfileById(this.profileId!)
      .subscribe((profile: Profile) => {
        const formattedUpdatedAt = dayjs(profile.updated_at).format(
          'DD/MM/YYYY [às] HH:mm:ss',
        );
        this.profileForm.patchValue({
          ...profile,
          updated_at: formattedUpdatedAt,
        });
        this.loading.hide();
      });
    this.loading.hide();
  };

  updateProfile = () => {
    this.loading.show();
    this.profilesService
      .updateProfile(this.profileId!, this.profileForm.value)
      .subscribe({
        next: () => {
          this.loading.hide();
          this.toast.openSuccess('Perfil atualizado com sucesso!');
        },
        error: () => {
          this.loading.hide();
          this.toast.openError(
            `Erro ao atualizar o perfil ${
              this.profileForm.get('name')?.value
            }. Tente novamente mais tarde!`,
          );
        },
      });
  };
}
