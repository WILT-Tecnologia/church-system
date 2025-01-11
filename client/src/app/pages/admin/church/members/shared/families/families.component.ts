import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ConfirmService } from 'app/components/confirm/confirm.service';
import { LoadingService } from 'app/components/loading/loading.service';
import { ModalService } from 'app/components/modal/modal.service';
import { NotFoundRegisterComponent } from 'app/components/not-found-register/not-found-register.component';
import { ToastService } from 'app/components/toast/toast.service';
import { Families } from 'app/model/Families';
import { MESSAGES } from 'app/utils/messages';
import {
  ActionsProps,
  CrudComponent,
} from '../../../../../../components/crud/crud.component';
import { MembersService } from '../../members.service';
import { MemberService } from '../member.service';
import { FamiliesFormComponent } from './families-form/families-form.component';
import { FamiliesService } from './families.service';

@Component({
  selector: 'app-families',
  templateUrl: './families.component.html',
  styleUrls: ['./families.component.scss'],
  standalone: true,
  imports: [CommonModule, NotFoundRegisterComponent, CrudComponent],
})
export class FamiliesComponent implements OnInit {
  @Input() families: Families[] = [];
  rendering: boolean = true;
  dataSourceMat = new MatTableDataSource<Families>(this.families);
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
    private confirmeService: ConfirmService,
    private loadingService: LoadingService,
    private toast: ToastService,
    private familiesService: FamiliesService,
    private modalService: ModalService,
    private membersService: MembersService,
    private memberService: MemberService,
  ) {}

  ngOnInit() {
    this.loadFamilies();
  }

  loadFamilies = () => {
    this.loadingService.show();
    const memberId = this.memberService.getEditingMemberId();
    console.log(memberId);
    this.membersService.getFamilyOfMemberId(memberId!).subscribe({
      next: (families) => {
        this.families = families.map((family) => ({
          ...family,
          combinedName: family?.person ? family.person?.name : family.name,
        }));
        this.dataSourceMat.data = this.families;
        this.dataSourceMat.paginator = this.paginator;
        this.dataSourceMat.sort = this.sort;
        this.rendering = false;
      },
      error: () => {
        this.loadingService.hide();
        this.toast.openError(MESSAGES.LOADING_ERROR);
      },
      complete: () => this.loadingService.hide(),
    });
  };

  openModalAddFamily = () => {
    return this.modalService.openModal(
      `modal-${Math.random()}`,
      FamiliesFormComponent,
      'Adicionar filiação',
      true,
      true,
    );
  };

  handleCreate = () => {
    const defaultMemberId = this.memberService.getEditingMemberId();

    const dialogRef = this.modalService.openModal(
      `modal-${Math.random()}`,
      FamiliesFormComponent,
      'Adicionar filiação',
      true,
      true,
      {
        families: { member: { id: defaultMemberId } } as Families,
      },
    );

    dialogRef.afterClosed().subscribe((result: Families) => {
      if (result) {
        this.loadFamilies();
      }
    });
  };

  handleEdit = (family: Families) => {
    const dialogRef = this.modalService.openModal(
      `modal-${Math.random()}`,
      FamiliesFormComponent,
      'Editar filiação',
      true,
      true,
      {
        families: family,
        id: family.id,
      },
    );

    dialogRef.afterClosed().subscribe((result: Families) => {
      if (result) {
        this.loadFamilies();
      }
    });
  };

  handleDelete(family: Families) {
    const nameFamily = family?.is_member
      ? family?.person?.name + ' | ' + family?.kinship?.name
      : family?.name + ' | ' + family?.kinship?.name;

    const modal = this.confirmeService.openConfirm(
      'Excluir o parentesco',
      `Tem certeza que deseja excluir o parentesco: ${nameFamily} ?`,
      'Confirmar',
      'Cancelar',
    );

    modal.afterClosed().subscribe((result) => {
      if (result) {
        this.loadingService.show();
        this.familiesService.deleteFamily(family).subscribe({
          next: () => this.toast.openSuccess(MESSAGES.DELETE_SUCCESS),
          error: () => {
            this.loadingService.hide();
            this.toast.openError(MESSAGES.DELETE_ERROR);
          },
          complete: () => {
            this.loadFamilies();
            this.loadingService.hide();
          },
        });
      }
    });
  }
}
