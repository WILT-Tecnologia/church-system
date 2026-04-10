import { Component, inject, OnInit, signal } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ConfirmService } from '@app/components/confirm/confirm.service';
import { CrudComponent } from '@app/components/crud/crud.component';
import { ActionsProps, ColumnDefinitionsProps } from '@app/components/crud/types';
import { LoadingService } from '@app/components/loading/loading.service';
import { ModalAction } from '@app/components/modal/modal.component';
import { ModalService } from '@app/components/modal/modal.service';
import { MESSAGES } from '@app/components/toast/messages';
import { ToastService } from '@app/components/toast/toast.service';
import { Profile } from '@app/model/Profile';
import { AuthService } from '@app/services/auth/auth.service';
import { Subject } from 'rxjs';
import { ProfileComponent } from './profile/profile.component';
import { ProfilesService } from './profiles.service';

@Component({
  selector: 'app-profiles',
  templateUrl: './profiles.component.html',
  styleUrls: ['./profiles.component.scss'],
  imports: [CrudComponent],
})
export class ProfilesComponent implements OnInit {
  private modalService = inject(ModalService);
  private confirmModalService = inject(ConfirmService);
  private toastService = inject(ToastService);
  private loadingService = inject(LoadingService);
  private profilesService = inject(ProfilesService);
  private authService = inject(AuthService);
  private writePermission = this.authService.hasPermission('write_administrative_perfis');
  private deletePermission = this.authService.hasPermission('delete_administrative_perfis');

  profiles = signal<Profile[]>([]);
  dataSourceMat = new MatTableDataSource<Profile>([]);
  columnDefinitions: ColumnDefinitionsProps[] = [
    { key: 'status', header: 'Situação', type: 'boolean' },
    { key: 'name', header: 'Cargo', type: 'string' },
    { key: 'description', header: 'Descrição', type: 'string' },
    { key: 'updated_at', header: 'Última Atualização', type: 'datetime' },
  ];
  actions: ActionsProps[] = [
    {
      type: 'toggle',
      activeLabel: 'Ativar',
      inactiveLabel: 'Desativar',
      action: (profile: Profile) => this.onChangeStatus(profile),
    },
    {
      type: 'edit',
      icon: 'edit',
      label: 'Editar',
      color: 'inherit',
      action: (profile: Profile) => this.onEdit(profile),
      visible: () => this.writePermission,
    },
    {
      type: 'delete',
      icon: 'delete',
      label: 'Excluir',
      color: 'warn',
      action: (profile: Profile) => this.onDelete(profile),
      visible: () => this.deletePermission,
    },
  ];

  ngOnInit() {
    this.loadProfiles();
  }

  loadProfiles() {
    this.profilesService.getAllProfiles().subscribe({
      next: (profilesResp) => {
        this.profiles.set(profilesResp);
        this.dataSourceMat.data = profilesResp;
      },
      error: () => {
        this.loadingService.hide();
        this.toastService.openError(MESSAGES.LOADING_ERROR);
      },
      complete: () => this.loadingService.hide(),
    });
  }

  onCreate() {
    const submitSubject = new Subject<void>();
    const formAction: ModalAction[] = [
      {
        label: 'Cancelar',
        type: 'stroked',
        color: 'warn',
        icon: 'close',
        onClick: (ref) => ref.close(),
      },
      {
        label: 'Salvar',
        type: 'flat',
        color: 'primary',
        icon: 'save',
        onClick: () => submitSubject.next(),
      },
    ];

    const modal = this.modalService.openModal(
      `modal-${Math.random()}`,
      ProfileComponent,
      'Adicionando um novo perfil',
      true,
      true,
      { submitSubject },
      undefined,
      false,
      formAction,
    );

    modal.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.loadProfiles();
      }
    });
  }

  onEdit(profile: Profile) {
    const submitSubject = new Subject<void>();
    const formAction: ModalAction[] = [
      {
        label: 'Cancelar',
        type: 'stroked',
        color: 'warn',
        icon: 'close',
        onClick: (ref) => ref.close(),
      },
      {
        label: 'Atualizar',
        type: 'flat',
        color: 'primary',
        icon: 'save',
        onClick: () => submitSubject.next(),
      },
    ];

    const modal = this.modalService.openModal(
      `modal-${Math.random()}`,
      ProfileComponent,
      `Editando o perfil ${profile.name}`,
      true,
      true,
      { profile, submitSubject },
      undefined,
      false,
      formAction,
    );

    modal.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.loadProfiles();
      }
    });
  }

  onDelete(profile: Profile) {
    const modal = this.confirmModalService.openConfirm(
      'Confirmar exclusão',
      `Tem certeza que deseja excluir o perfil ${profile.name}?`,
      'Excluir',
      'Cancelar',
    );

    modal.afterClosed().subscribe((result: Profile) => {
      if (result) {
        this.profilesService.deleteProfile(profile.id).subscribe({
          next: () => this.toastService.openSuccess(MESSAGES.DELETE_SUCCESS),
          error: () => this.toastService.openError(MESSAGES.DELETE_ERROR),
          complete: () => this.loadProfiles(),
        });
      }
    });
  }

  onChangeStatus(profile: Profile) {
    this.loadingService.show();
    const updatedStatus = !profile.status;
    profile.status = updatedStatus;

    this.profilesService.updatedStatus(profile).subscribe({
      next: () =>
        this.toastService.openSuccess(
          `Perfil ${updatedStatus ? 'ativado' : 'desativado'} com sucesso!`,
        ),
      error: () => this.toastService.openError(MESSAGES.UPDATE_ERROR),
      complete: () => this.loadProfiles(),
    });
  }
}
