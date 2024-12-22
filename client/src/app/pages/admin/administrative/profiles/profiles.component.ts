import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ConfirmService } from 'app/components/confirm/confirm.service';
import { LoadingService } from 'app/components/loading/loading.service';
import { ModalService } from 'app/components/modal/modal.service';
import { NotFoundRegisterComponent } from 'app/components/not-found-register/not-found-register.component';
import { ToastService } from 'app/components/toast/toast.service';
import { Profile } from 'app/model/Profile';
import { MESSAGES } from 'app/utils/messages';
import { CrudComponent } from '../../../../components/crud/crud.component';
import { ProfileComponent } from './profile/profile.component';
import { ProfilesService } from './profiles.service';

@Component({
  selector: 'app-profiles',
  standalone: true,
  templateUrl: './profiles.component.html',
  styleUrls: ['./profiles.component.scss'],
  imports: [
    MatCardModule,
    MatButtonModule,
    NotFoundRegisterComponent,
    CommonModule,
    CrudComponent,
  ],
})
export class ProfilesComponent implements OnInit {
  profiles: Profile[] = [];
  rendering: boolean = true;
  dataSourceMat = new MatTableDataSource<Profile>(this.profiles);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  columnDefinitions = [
    { key: 'status', header: 'Situação', type: 'boolean' },
    { key: 'name', header: 'Cargo', type: 'string' },
    { key: 'description', header: 'Descrição', type: 'string' },
    { key: 'updated_at', header: 'Última atalização', type: 'datetime' },
  ];

  constructor(
    private modal: ModalService,
    private confirmModal: ConfirmService,
    private toast: ToastService,
    private loading: LoadingService,
    private profilesService: ProfilesService,
  ) {}

  ngOnInit() {
    this.loadProfiles();
  }

  loadProfiles = () => {
    this.profilesService.getProfiles().subscribe({
      next: (profiles) => {
        this.profiles = profiles;
        this.dataSourceMat.data = this.profiles;
        this.dataSourceMat.paginator = this.paginator;
        this.dataSourceMat.sort = this.sort;
        this.rendering = false;
      },
      error: () => {
        this.loading.hide();
        this.toast.openError(MESSAGES.LOADING_ERROR);
      },
      complete: () => this.loading.hide(),
    });
  };

  addNewProfile = () => {
    const modal = this.modal.openModal(
      `modal-${Math.random()}`,
      ProfileComponent,
      'Adicionando um novo perfil',
      true,
      true,
    );

    modal.afterClosed().subscribe((result) => {
      if (result) {
        this.loadProfiles();
      }
    });
  };

  editProfile = (profile: Profile) => {
    const modal = this.modal.openModal(
      `modal-${Math.random()}`,
      ProfileComponent,
      'Editando um perfil',
      true,
      true,
      { profile },
    );

    modal.afterClosed().subscribe((result) => {
      if (result) {
        this.loadProfiles();
      }
    });
  };

  deleteProfile = (profile: Profile) => {
    const modal = this.confirmModal.openConfirm(
      'Confirmar exclusão',
      `Tem certeza que deseja excluir o perfil ${profile.name}?`,
      'Excluir',
      'Cancelar',
    );

    modal.afterClosed().subscribe((result: Profile) => {
      if (result) {
        this.profilesService.deleteProfile(profile.id).subscribe({
          next: () => this.toast.openSuccess(MESSAGES.DELETE_SUCCESS),
          error: () => {
            this.loading.hide();
            this.toast.openError(MESSAGES.DELETE_ERROR);
          },
          complete: () => {
            this.loadProfiles();
            this.loading.hide();
          },
        });
      }
    });
  };

  toggleStatus = (profile: Profile) => {
    const updatedStatus = !profile.status;
    profile.status = updatedStatus;

    this.profilesService.updatedStatus(profile.id, updatedStatus).subscribe({
      next: () => {
        this.toast.openSuccess(
          `Perfil ${updatedStatus ? 'ativado' : 'desativado'} com sucesso!`,
        );
      },
      error: () => {
        this.loading.hide();
        this.toast.openError(MESSAGES.UPDATE_ERROR);
      },
      complete: () => {
        this.loadProfiles();
        this.loading.hide();
      },
    });
  };
}
