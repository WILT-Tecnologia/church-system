import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ConfirmService } from 'app/components/confirm/confirm.service';
import { ActionsProps, CrudComponent } from 'app/components/crud/crud.component';
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
  @Input() set families(value: Families[]) {
    if (value) {
      this._families = value.map((family) => ({
        ...family,
        combinedName: family.person ? family.person.name : family.name || '',
      }));
      this.dataSourceMat.data = this._families;
    } else {
      this._families = [];
      this.dataSourceMat.data = [];
    }
  }
  @Output() familyUpdated = new EventEmitter<Families[]>();
  rendering: boolean = true;
  dataSourceMat = new MatTableDataSource<Families>(this._families);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  actions: ActionsProps[] = [
    {
      type: 'edit',
      tooltip: 'Editar filiação',
      icon: 'edit',
      label: 'Editar',
      action: (family: Families) => this.handleEdit(family),
    },
    {
      type: 'delete',
      tooltip: 'Excluir filiação',
      icon: 'delete',
      label: 'Excluir',
      action: (family: Families) => this.handleDelete(family),
    },
  ];

  columnDefinitions = [
    { key: 'is_member', header: 'A filiação é membro?', type: 'boolean' },
    { key: 'combinedName', header: 'Nome', type: 'string' },
    { key: 'kinship.name', header: 'Parentesco', type: 'string' },
  ];

  constructor(
    private confirmService: ConfirmService,
    private loading: LoadingService,
    private toast: ToastService,
    private familiesService: FamiliesService,
    private modal: ModalService,
    private membersService: MembersService,
  ) {}

  ngOnInit() {
    this.dataSourceMat.paginator = this.paginator;
    this.dataSourceMat.sort = this.sort;
    this.rendering = false;
  }

  get familiesData(): Families[] {
    return this._families;
  }

  handleCreate = () => {
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
        const updatedFamily = { ...result, combinedName: result.person ? result.person.name : result.name || '' };
        this._families = [...this._families, updatedFamily];
        this.dataSourceMat.data = this._families;
        this.familyUpdated.emit(this._families);
      }
    });
  };

  handleEdit = (family: Families) => {
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
        const updatedFamily = { ...result, combinedName: result.person ? result.person.name : result.name || '' };
        const index = this._families.findIndex((f) => f.id === result.id);
        if (index !== -1) {
          this._families[index] = updatedFamily;
          this.dataSourceMat.data = [...this._families];
          this.familyUpdated.emit(this._families);
        }
      }
    });
  };

  handleDelete(family: Families) {
    const nameFamily = family.is_member
      ? `${family.person?.name} | ${family.kinship?.name}`
      : `${family.name} | ${family.kinship?.name}`;

    const modal = this.confirmService.openConfirm(
      'Excluir o parentesco',
      `Tem certeza que deseja excluir o parentesco: ${nameFamily} ?`,
      'Confirmar',
      'Cancelar',
    );

    modal.afterClosed().subscribe((result) => {
      if (result) {
        this.loading.show();
        this.familiesService.deleteFamily(family).subscribe({
          next: () => {
            this._families = this._families.filter((f) => f.id !== family.id);
            this.dataSourceMat.data = this._families;
            this.toast.openSuccess(MESSAGES.DELETE_SUCCESS);
            this.familyUpdated.emit(this._families);
          },
          error: () => {
            this.loading.hide();
            this.toast.openError(MESSAGES.DELETE_ERROR);
          },
          complete: () => this.loading.hide(),
        });
      }
    });
  }
}
