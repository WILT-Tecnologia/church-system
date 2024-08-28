import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { NotFoundRegisterComponent } from '../../../../components/not-found-register/not-found-register.component';
import { TableComponent } from '../../../../components/table/table.component';
import { Profile } from '../../../../model/Profile';
import { SnackbarService } from '../../../../service/snackbar/snackbar.service';
import { ProfilesService } from './profiles.service';

@Component({
  selector: 'app-profiles',
  standalone: true,
  templateUrl: './profiles.component.html',
  styleUrls: ['./profiles.component.scss'],
  imports: [
    MatCardModule,
    MatButtonModule,
    TableComponent,
    NotFoundRegisterComponent,
    CommonModule,
  ],
})
export class ProfilesComponent implements OnInit {
  profiles: Profile[] = [];
  displayedColumns: string[] = ['name', 'description', 'status', 'actions'];
  columnDefinitions = {
    name: 'Nome',
    description: 'Descrição',
    status: 'Situação',
    actions: 'Ações',
  };

  constructor(
    private router: Router,
    private profilesService: ProfilesService,
    private snackbarService: SnackbarService
  ) {}

  ngOnInit() {
    this.loadProfiles();
  }

  loadProfiles = () => {
    this.profilesService.getProfiles().subscribe((profiles) => {
      this.profiles = profiles;
    });
  };

  addNewProfile = (): void => {
    this.router.navigate(['administrative/profiles/profile/new']);
  };

  editProfile = (profile: Profile): void => {
    this.router.navigate(['administrative/profiles/profile/edit', profile.id]);
  };

  deleteProfile = (profile: Profile): void => {
    this.profilesService.deleteProfile(profile.id).subscribe({
      next: () => {
        this.snackbarService.openSuccess('Perfil excluído com sucesso!');
        this.loadProfiles();
      },
      error: () => {
        this.snackbarService.openError('Erro ao excluir o perfil!');
      },
    });
  };
}
