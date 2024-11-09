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
import { Profile } from '../../../../../model/Profile';
import { CoreService } from '../../../../../service/core/core.service';
import { SnackbarService } from '../../../../../service/snackbar/snackbar.service';
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
  ],
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  isEditMode: boolean = false;
  profileId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private core: CoreService,
    private route: ActivatedRoute,
    private loadingService: LoadingService,
    private snackbarService: SnackbarService,
    private profilesService: ProfilesService
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
    this.profileId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.profileId;
    if (this.isEditMode) {
      this.handleEditMode();
    }
  }

  get pageTitle() {
    return this.isEditMode ? 'Editar perfil' : 'Criar perfil';
  }

  handleBack = () => {
    this.core.handleBack();
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
    this.loadingService.show();
    this.profilesService.createProfile(this.profileForm.value).subscribe({
      next: () => {
        this.loadingService.hide();
        this.snackbarService.openSuccess('Perfil criado com sucesso!');
        this.core.handleBack();
      },
      error: () => {
        this.loadingService.hide();
        this.snackbarService.openError(
          `Erro ao criar o perfil ${
            this.profileForm.get('name')?.value
          }. Tente novamente mais tarde!`
        );
      },
    });
  };

  handleEditMode = () => {
    this.loadingService.show();
    this.profilesService
      .getProfileById(this.profileId!)
      .subscribe((profile: Profile) => {
        const formattedUpdatedAt = dayjs(profile.updated_at).format(
          'DD/MM/YYYY [às] HH:mm:ss'
        );
        this.profileForm.patchValue({
          ...profile,
          updated_at: formattedUpdatedAt,
        });
        this.loadingService.hide();
      });
    this.loadingService.hide();
  };

  updateProfile = () => {
    this.loadingService.show();
    this.profilesService
      .updateProfile(this.profileId!, this.profileForm.value)
      .subscribe({
        next: () => {
          this.loadingService.hide();
          this.snackbarService.openSuccess('Perfil atualizado com sucesso!');
          this.core.handleBack();
        },
        error: () => {
          this.loadingService.hide();
          this.snackbarService.openError(
            `Erro ao atualizar o perfil ${
              this.profileForm.get('name')?.value
            }. Tente novamente mais tarde!`
          );
        },
      });
  };
}
