import { Component, inject, OnInit, signal } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

import { ConfirmService } from 'app/components/confirm/confirm.service';
import { CrudComponent } from 'app/components/crud/crud.component';
import { ActionsProps, ColumnDefinitionsProps } from 'app/components/crud/types';
import { LoadingService } from 'app/components/loading/loading.service';
import { ModalAction } from 'app/components/modal/modal.component';
import { ModalService } from 'app/components/modal/modal.service';
import { MESSAGES } from 'app/components/toast/messages';
import { ToastService } from 'app/components/toast/toast.service';
import { Patrimonies } from 'app/model/Patrimonies';
import { AuthService } from 'app/services/auth/auth.service';
import { Subject } from 'rxjs';
import { PatrimoniesFormComponent } from './patrimonies-form/patrimonies-form.component';
import { PatrimoniesService } from './patrimonies.service';

@Component({
  selector: 'app-patrimonies',
  templateUrl: './patrimonies.component.html',
  styleUrl: './patrimonies.component.scss',
  imports: [CrudComponent],
})
export class PatrimoniesComponent implements OnInit {
  private readonly toastService = inject(ToastService);
  private readonly loadingService = inject(LoadingService);
  private readonly confirmService = inject(ConfirmService);
  private readonly modalService = inject(ModalService);
  private readonly patrimoniesService = inject(PatrimoniesService);
  private readonly authService = inject(AuthService);
  private readonly writeChurchPatrimonios = this.authService.hasPermission(
    'write_church_patrimonios',
  );
  private readonly deleteChurchPatrimonios = this.authService.hasPermission(
    'delete_church_patrimonios',
  );

  patrimonies = signal<Patrimonies[]>([]);
  dataSourceMat = new MatTableDataSource<Patrimonies>(this.patrimonies());
  columnDefinitions: ColumnDefinitionsProps[] = [
    { key: 'church.name', header: 'Igreja', type: 'string' },
    { key: 'number', header: 'N° do patrimônio', type: 'string' },
    { key: 'name', header: 'Nome', type: 'string' },
    { key: 'price', header: 'Preço', type: 'currency' },
    { key: 'type_entry', header: 'Tipo de entrada', type: 'typeEntry' },
    { key: 'registration_date', header: 'Data de registro', type: 'date' },
    { key: 'donorOrMember', header: 'Doador', type: 'string' },
    { key: 'is_member', header: 'É Membro?', type: 'YesNo' },
  ];
  actions: ActionsProps[] = [
    {
      type: 'edit',
      icon: 'edit',
      label: 'Editar',
      color: 'inherit',
      action: (patrimonies: Patrimonies) => this.editPatrimonies(patrimonies),
      visible: () => this.writeChurchPatrimonios,
    },
    {
      type: 'delete',
      icon: 'delete',
      label: 'Excluir',
      color: 'warn',
      action: (patrimonies: Patrimonies) => this.deletePatrimonies(patrimonies),
      visible: () => this.deleteChurchPatrimonios,
    },
  ];

  ngOnInit() {
    this.loadPatrimonies();
  }

  private loadPatrimonies() {
    this.patrimoniesService.getAllPatrimonies().subscribe({
      next: (data) => {
        this.patrimonies.set(
          data.map((patrimonies) => ({
            donorOrMember: patrimonies.donor
              ? patrimonies.donor
              : (patrimonies.member?.person?.name ?? '--'),
            ...patrimonies,
          })),
        );
      },
      error: () => this.toastService.openError(MESSAGES.LOADING_ERROR),
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
      PatrimoniesFormComponent,
      'Adicionando novo patrimônio',
      true,
      true,
      { submitSubject },
      undefined,
      false,
      formAction,
    );

    modal.afterClosed().subscribe((data: FormData) => {
      if (data) {
        this.patrimoniesService.createPatrimonies(data).subscribe({
          next: () => this.toastService.openSuccess(MESSAGES.CREATE_SUCCESS),
          error: () => this.toastService.openError(MESSAGES.CREATE_ERROR),
          complete: () => this.loadPatrimonies(),
        });
      }
    });
  }

  private editPatrimonies(patrimonies: Patrimonies) {
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
      PatrimoniesFormComponent,
      `Editando o patrimonio ${patrimonies.number} - ${patrimonies.name}`,
      true,
      true,
      { patrimonies, submitSubject },
      undefined,
      false,
      formAction,
    );

    modal.afterClosed().subscribe((data: FormData) => {
      if (data) {
        this.patrimoniesService.updatePatrimonies(data).subscribe({
          next: () => this.toastService.openSuccess(MESSAGES.UPDATE_SUCCESS),
          error: () => this.toastService.openError(MESSAGES.UPDATE_ERROR),
          complete: () => this.loadPatrimonies(),
        });
      }
    });
  }

  private deletePatrimonies(patrimonies: Patrimonies) {
    const modal = this.confirmService.openConfirm(
      'Excluir patrimônio',
      `Tem certeza que deseja excluir o patrimônio ${patrimonies.number} - ${patrimonies.name}?`,
      'Confirmar',
      'Cancelar',
    );

    modal.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.patrimoniesService.deletePatrimonies(patrimonies).subscribe({
          next: () => this.toastService.openSuccess(MESSAGES.DELETE_SUCCESS),
          error: () => this.toastService.openError(MESSAGES.DELETE_ERROR),
          complete: () => this.loadPatrimonies(),
        });
      }
    });
  }
}
