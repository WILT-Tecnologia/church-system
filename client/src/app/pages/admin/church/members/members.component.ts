import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';

import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ConfirmService } from 'app/components/confirm/confirm.service';
import { LoadingService } from 'app/components/loading/loading.service';
import { ModalService } from 'app/components/modal/modal.service';
import { NotFoundRegisterComponent } from 'app/components/not-found-register/not-found-register.component';
import { ToastService } from 'app/components/toast/toast.service';
import { Families } from 'app/model/Families';
import { Members } from 'app/model/Members';
import { MESSAGES } from 'app/utils/messages';
import { FormatValuesPipe } from 'app/utils/pipes/format-values.pipe';
import { MemberComponent } from './member/member.component';
import { MembersService } from './members.service';
import { MemberService } from './shared/member.service';

@Component({
  selector: 'app-members',
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.scss'],
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatTableModule,
    MatSortModule,
    MatDividerModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule,
    CommonModule,
    FormatValuesPipe,
    NotFoundRegisterComponent,
  ],
})
export class MembersComponent implements OnInit, AfterViewInit, OnChanges {
  families!: Families[];
  member: Members[] = [];
  pageSizeOptions: number[] = [25, 50, 100, 200];
  pageSize: number = 25;
  dataSourceMat = new MatTableDataSource<Members>(this.member);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  columnDefinitions = [
    { key: 'person.name', header: 'Nome', type: 'string' },
    { key: 'person.cpf', header: 'CPF', type: 'cpf' },
    { key: 'person.email', header: 'Email', type: 'string' },
    { key: 'person.birth_date', header: 'Data de Nascimento', type: 'date' },
    { key: 'person.sex', header: 'Sexo', type: 'sex' },
    { key: 'person.phone_one', header: 'Celular', type: 'phone' },
    { key: 'church.name', header: 'Igreja', type: 'string' },
    {
      key: 'church.responsible.name',
      header: 'Pastor presidente',
      type: 'string',
    },
    { key: 'baptism_date', header: 'Data do batismo', type: 'date' },
  ];

  displayedColumns = this.columnDefinitions
    .map((col) => col.key)
    .concat('actions');

  constructor(
    private confirmeService: ConfirmService,
    private loading: LoadingService,
    private toast: ToastService,
    private membersService: MembersService,
    private modalService: ModalService,
    private memberService: MemberService,
  ) {}

  ngOnInit() {
    this.loadMembers();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['member'] && changes['member'].currentValue) {
      this.dataSourceMat.data = this.member;
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value
      .trim()
      .toLowerCase();

    this.dataSourceMat.filterPredicate = (data: any, filter: string) => {
      return this.searchInObject(data, filter);
    };

    this.dataSourceMat.filter = filterValue;

    if (this.dataSourceMat.paginator) {
      this.dataSourceMat.paginator.firstPage();
    }
  }

  searchInObject(obj: any, searchText: string): boolean {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        if (typeof value === 'object' && value !== null) {
          if (this.searchInObject(value, searchText)) {
            return true;
          }
        } else {
          if (String(value).toLowerCase().includes(searchText)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  ngAfterViewInit() {
    this.dataSourceMat.paginator = this.paginator;
    this.dataSourceMat.sort = this.sort;
  }

  loadMembers = () => {
    this.loading.show();
    this.membersService.getMembers().subscribe({
      next: (members) => {
        this.member = members;
        this.dataSourceMat.data = this.member;
        this.dataSourceMat.paginator = this.paginator;
        this.dataSourceMat.sort = this.sort;
      },
      error: () => this.toast.openError(MESSAGES.LOADING_ERROR),
      complete: () => this.loading.hide(),
    });
  };

  addNewMembers = () => {
    const dialogRef = this.modalService.openModal(
      `modal-${Math.random()}`,
      MemberComponent,
      'Adicionar novo membro',
      true,
      true,
      {},
      'dialog',
    );

    dialogRef.afterClosed().subscribe((result: Members) => {
      if (result) {
        this.loadMembers();
      }
    });
  };

  editMembers = (member: Members): void => {
    this.memberService.setEditingMemberId(member.id);
    const dialogRef = this.modalService.openModal(
      `modal-${Math.random()}`,
      MemberComponent,
      'Editar membro',
      true,
      true,
      { members: member, id: member.id },
      'dialog',
    );

    dialogRef.afterClosed().subscribe((result: Members) => {
      if (result) {
        this.loadMembers();
      }
    });
  };

  deleteMembers = (members: Members): void => {
    this.confirmeService
      .openConfirm(
        'Excluir membros',
        `Tem certeza que deseja excluir o membro ${members.person.name} ?`,
        'Confirmar',
        'Cancelar',
      )
      .afterClosed()
      .subscribe((result: Members) => {
        if (result) {
          this.loading.show();
          this.membersService.deleteMember(members.id).subscribe({
            next: () => {
              this.toast.openSuccess(MESSAGES.DELETE_SUCCESS);
              this.loadMembers();
            },
            error: () => {
              this.loading.hide();
              this.toast.openError(MESSAGES.DELETE_ERROR);
            },
            complete: () => this.loading.hide(),
          });
        }
      });
  };
}
