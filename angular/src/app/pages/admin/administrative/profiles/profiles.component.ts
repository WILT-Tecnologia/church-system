import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { LoadingService } from 'app/components/loading/loading.service';
import { NotFoundRegisterComponent } from 'app/components/not-found-register/not-found-register.component';
import { TableComponent } from 'app/components/table/table.component';
import { ToastService } from 'app/components/toast/toast.service';
import { Profile } from 'app/model/Profile';
import { MESSAGES } from 'app/utils/messages';
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
    private toast: ToastService,
    private loading: LoadingService,
  ) {}

  ngOnInit() {
    this.loadProfiles();
  }

  loadProfiles = () => {
    this.loading.show();
    this.profilesService.getProfiles().subscribe({
      next: (profiles) => {
        this.profiles = profiles;
      },
      error: () => {
        this.loading.hide();
        this.toast.openError(MESSAGES.LOADING_ERROR);
      },
      complete: () => this.loading.hide(),
    });
  };

  addNewProfile = (): void => {
    console.log('addNewProfile');
  };

  editProfile = (profile: Profile): void => {
    console.log('editProfile', profile);
  };

  deleteProfile = (profile: Profile): void => {
    this.profilesService.deleteProfile(profile.id).subscribe({
      next: () => {
        this.toast.openSuccess('Perfil excluído com sucesso!');
        this.loadProfiles();
      },
      error: () => {
        this.toast.openError('Erro ao excluir o perfil!');
      },
    });
  };
}
