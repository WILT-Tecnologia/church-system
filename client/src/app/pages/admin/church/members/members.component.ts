import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { NotFoundRegisterComponent } from '../../../../components/not-found-register/not-found-register.component';

import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ConfirmService } from 'app/components/confirm/confirm.service';
import { LoadingService } from 'app/components/loading/loading.service';
import { Members } from '../../../../model/Members';
import { SnackbarService } from '../../../../service/snackbar/snackbar.service';
import { MemberFormComponent } from './member/member-form/member-form.component';
import { MembersService } from './members.service';

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
    NotFoundRegisterComponent,
    CommonModule,
  ],
})
export class MembersComponent<T> implements OnInit, AfterViewInit, OnChanges {
  member: Members[] = [];
  pageSizeOptions: number[] = [25, 50, 100, 200];
  pageSize: number = 25;
  dataSourceMat = new MatTableDataSource<Members>(this.member);
  columnDefinitions = [
    { key: 'person.name', header: 'Nome' },
    { key: 'person.cpf', header: 'CPF' },
    { key: 'person.email', header: 'Email' },
    { key: 'person.birth_date', header: 'Data de Nascimento' },
    { key: 'person.sex', header: 'Sexo' },
    { key: 'person.phone_one', header: 'Celular' },
    { key: 'church.name', header: 'Igreja' },
    { key: 'church.responsible.name', header: 'Pastor presidente' },
    { key: 'baptism_date', header: 'Data do batismo' },
  ];
  displayedColumns = this.columnDefinitions
    .map((col) => col.key)
    .concat('actions');

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private confirmeService: ConfirmService,
    private memberService: MembersService,
    private snackbarService: SnackbarService,
    private loading: LoadingService,
    private dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.loadMembers();
  }

  loadMembers = () => {
    this.memberService.getMembers().subscribe({
      next: (members) => {
        console.log(members);
        this.member = members;
        this.dataSourceMat = new MatTableDataSource<Members>(this.member);
        this.dataSourceMat.data = this.member;
        this.dataSourceMat.paginator = this.paginator;
        this.dataSourceMat.sort = this.sort;
      },
      error: (error) => {
        this.snackbarService.openError(error.message);
      },
    });
  };

  ngOnChanges(changes: SimpleChanges) {
    if (changes['dataSource'] && changes['dataSource'].currentValue) {
      this.dataSourceMat.data = this.dataSourceMat.data;
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value
      .trim()
      .toLowerCase();
    this.dataSourceMat.filter = filterValue;
    if (this.dataSourceMat.paginator) {
      this.dataSourceMat.paginator.firstPage();
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.paginator && this.sort) {
        this.dataSourceMat.paginator = this.paginator;
        this.dataSourceMat.sort = this.sort;
        this.sort.sortChange.emit();
      }
    });
  }

  /* initializeTableDataSource() {
    this.dataSourceMat.data = this.dataSourceMat.data;
    this.dataSourceMat.paginator = this.paginator;
    this.dataSourceMat.sort = this.sort;
  } */

  getNestedValue(member: any, key: string): any {
    return key.split('.').reduce((o, k) => (o || {})[k], member);
  }

  addNewMembers = (): void => {
    const dialogRef = this.dialog.open(MemberFormComponent, {
      width: '70dvw',
      maxWidth: '100%',
      height: 'auto',
      maxHeight: '100dvh',
      role: 'dialog',
      panelClass: 'dialog',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadMembers();
      }
    });
  };

  editMembers = (members: Members): void => {
    const dialogRef = this.dialog.open(MemberFormComponent, {
      width: '70dvw',
      maxWidth: '100%',
      height: 'auto',
      maxHeight: '100dvh',
      role: 'dialog',
      panelClass: 'dialog',
      disableClose: true,
      id: members.id,
      data: { members },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadMembers();
      }
    });
  };

  deleteMembers = (members: Members): void => {
    this.confirmeService
      .openConfirm(
        'Excluir membros',
        'Tem certeza que deseja excluir os membros?',
        'Confirmar',
        'Cancelar',
      )
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          this.loading.show();
          this.memberService.deleteMember(members.id).subscribe({
            next: () => {
              this.snackbarService.openSuccess('Membro excluído com sucesso!');
              this.loadMembers();
            },
            error: () => {
              this.loading.hide();
              this.snackbarService.openError('Erro ao excluir membros');
            },
            complete: () => this.loading.hide(),
          });
        }
      });
  };
}
