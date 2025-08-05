import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Inject, OnInit, Output, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import { ConfirmService } from 'app/components/confirm/confirm.service';
import { CrudComponent } from 'app/components/crud/crud.component';
import { ActionsProps, ColumnDefinitionsProps } from 'app/components/crud/types';
import { LoadingService } from 'app/components/loading/loading.service';
import { ModalService } from 'app/components/modal/modal.service';
import { NotFoundRegisterComponent } from 'app/components/not-found-register/not-found-register.component';
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
  imports: [CommonModule, NotFoundRegisterComponent, CrudComponent],
})
export class FamiliesComponent implements OnInit {
  private _families: Families[] = [];
  rendering: boolean = true;
  dataSourceMat = new MatTableDataSource<Families>(this._families);
  @Output() familyUpdated = new EventEmitter<Families[]>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  columnDefinitions: ColumnDefinitionsProps[] = [
    { key: 'is_member', header: 'A filiação é membro?', type: 'YesNo' },
    { key: 'combinedName', header: 'Nome', type: 'string' },
    { key: 'kinship.name', header: 'Parentesco', type: 'string' },
  ];
  actions: ActionsProps[] = [
    {
      type: 'edit',
      tooltip: 'Editar filiação',
      icon: 'edit',
      label: 'Editar',
      action: (family: Families) => this.handleUpdate(family),
    },
    {
      type: 'delete',
      tooltip: 'Excluir filiação',
      icon: 'delete',
      label: 'Excluir',
      action: (family: Families) => this.handleDelete(family),
    },
  ];

  constructor(
    private confirmService: ConfirmService,
    private loading: LoadingService,
    private toast: ToastService,
    private familiesService: FamiliesService,
    private modal: ModalService,
    private membersService: MembersService,
    @Inject(MAT_DIALOG_DATA) public data: { families: Families[]; id: number },
  ) {}

  ngOnInit() {
    this.dataSourceMat.paginator = this.paginator;
    this.dataSourceMat.sort = this.sort;
    this.rendering = false;
    this.findAll();
  }

  get familiesData(): Families[] {
    return this._families;
  }

  private findAll = () => {
    this.loading.show();
    const memberId = this.membersService.getEditingMemberId();
    if (memberId) {
      this.membersService.getFamilyOfMemberId(memberId).subscribe({
        next: (families) => {
          this._families = families.map((family) => ({
            ...family,
            combinedName: family.person ? family.person.name : family.name || '',
          }));
          this.dataSourceMat.data = this._families;
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
