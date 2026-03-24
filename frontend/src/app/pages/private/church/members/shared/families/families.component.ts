import { Component, EventEmitter, inject, OnInit, Output, signal } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ConfirmService } from 'app/components/confirm/confirm.service';
import { CrudComponent } from 'app/components/crud/crud.component';
import { ActionsProps, ColumnDefinitionsProps } from 'app/components/crud/types';
import { LoadingService } from 'app/components/loading/loading.service';
import { ModalService } from 'app/components/modal/modal.service';
import { MESSAGES } from 'app/components/toast/messages';
import { ToastService } from 'app/components/toast/toast.service';
import { Families } from 'app/model/Families';
import { MembersService } from '../../members.service';
import { FamiliesFormComponent } from './families-form/families-form.component';
import { FamiliesService } from './families.service';

@Component({
  selector: 'app-families',
  templateUrl: './families.component.html',
  styleUrls: ['./families.component.scss'],
  imports: [CrudComponent],
})
export class FamiliesComponent implements OnInit {
  private confirmService = inject(ConfirmService);
  private loading = inject(LoadingService);
  private toast = inject(ToastService);
  private familiesService = inject(FamiliesService);
  private modal = inject(ModalService);
  private membersService = inject(MembersService);
  public data = inject(MAT_DIALOG_DATA);
  families = signal<Families[]>([]);
  rendering = signal(true);
  dataSourceMat = new MatTableDataSource<Families>([]);
  @Output() familyUpdated = new EventEmitter<Families[]>();
  columnDefinitions: ColumnDefinitionsProps[] = [
    { key: 'is_member', header: 'A filiação é membro?', type: 'YesNo' },
    { key: 'combinedName', header: 'Nome', type: 'string' },
    { key: 'kinship.name', header: 'Parentesco', type: 'string' },
  ];
  actions: ActionsProps[] = [
    {
      type: 'edit',
      icon: 'edit',
      label: 'Editar',
      color: 'inherit',
      action: (family: Families) => this.handleUpdate(family),
    },
    {
      type: 'delete',
      icon: 'delete',
      label: 'Excluir',
      action: (family: Families) => this.handleDelete(family),
    },
  ];

  ngOnInit() {
    this.rendering.set(false);
    this.findAll();
  }

  get familiesData(): Families[] {
    return this.families();
  }

  private findAll = () => {
    this.loading.show();
    const memberId = this.membersService.getEditingMemberId();
    if (memberId) {
      this.membersService.getFamilyOfMemberId(memberId).subscribe({
        next: (familiesResp) => {
          const mapped = familiesResp.map((family) => ({
            ...family,
            combinedName: family.person ? family.person.name : family.name || '',
          }));
          this.families.set(mapped);
          this.dataSourceMat.data = mapped;
        },
        error: () => this.toast.openError(MESSAGES.LOADING_ERROR),
        complete: () => this.loading.hide(),
      });
    } else {
      this.toast.openError('Membro não encontrado para encontrar suas filiações.');
      this.loading.hide();
    }
  };

  onCreate = () => {
    const defaultMemberId = this.membersService.getEditingMemberId();

    const dialogRef = this.modal.openModal(
      `modal-${Math.random()}`,
      FamiliesFormComponent,
      'Adicionando filiação',
      true,
      true,
      {
        families: { member: { id: defaultMemberId } } as Families,
      },
    );

    dialogRef.afterClosed().subscribe((result: Families) => {
      if (result) {
        this.findAll();
      }
    });
  };

  handleUpdate = (family: Families) => {
    const existFamily = family.person ? family.person.name : family.name;

    const dialogRef = this.modal.openModal(
      `modal-${Math.random()}`,
      FamiliesFormComponent,
      `Editando a filiação ${existFamily}`,
      true,
      true,
      {
        families: family,
        id: family.id,
      },
    );

    dialogRef.afterClosed().subscribe((result: Families) => {
      if (result) {
        this.findAll();
      }
    });
  };

  handleDelete = (family: Families) => {
    const nameFamily = family.is_member
      ? `${family.person?.name} | ${family.kinship?.name}`
      : `${family.name} | ${family.kinship?.name}`;

    const modal = this.confirmService.openConfirm(
      'Exclusão de filiação',
      `O que será excluído: ${nameFamily}`,
      'Confirmar',
      'Cancelar',
    );

    modal.afterClosed().subscribe((result) => {
      if (result) {
        this.loading.show();
        this.familiesService.deleteFamily(family).subscribe({
          next: () => {
            this.toast.openSuccess(MESSAGES.DELETE_SUCCESS);
          },
          error: () => {
            this.loading.hide();
            this.toast.openError(MESSAGES.DELETE_ERROR);
          },
          complete: () => {
            this.findAll();
            this.loading.hide();
          },
        });
      }
    });
  };
}
