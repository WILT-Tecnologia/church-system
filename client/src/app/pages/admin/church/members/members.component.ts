import { CommonModule, DatePipe } from '@angular/common';
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
import { MatTooltipModule } from '@angular/material/tooltip';
import { ConfirmService } from 'app/components/confirm/confirm.service';
import { LoadingService } from 'app/components/loading/loading.service';
import { MESSAGES } from 'app/service/snackbar/messages';
import { DateFormatPipe } from 'app/utils/pipe/BirthDateFormatPipe';
import { Members } from '../../../../model/Members';
import { SnackbarService } from '../../../../service/snackbar/snackbar.service';
import { MemberComponent } from './member-form/member-form.component';
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
    MatTooltipModule,
    NotFoundRegisterComponent,
    CommonModule,
  ],
  providers: [DatePipe],
})
export class MembersComponent implements OnInit, AfterViewInit, OnChanges {
  member: Members[] = [];
  pageSizeOptions: number[] = [25, 50, 100, 200];
  pageSize: number = 25;
  dataSourceMat = new MatTableDataSource<Members>(this.member);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  columnDefinitions = [
    { key: 'person.name', header: 'Nome' },
    { key: 'person.cpf', header: 'CPF' },
    { key: 'person.email', header: 'Email' },
    { key: 'person.birth_date', header: 'Data de Nascimento' },
    { key: 'person.sex', header: 'Sexo' },
    { key: 'person.phone_one', header: 'Celular' },
    { key: 'church.name', header: 'Igreja' },
    { key: 'church.responsible.name', header: 'Pastor presidente' },
    { key: 'baptism_date', header: 'Data do batismo', type: 'date' },
  ];
  displayedColumns = this.columnDefinitions
    .map((col) => col.key)
    .concat('actions');

  dateFormatPipe = new DateFormatPipe();

  constructor(
    private confirmeService: ConfirmService,
    private loading: LoadingService,
    private snackbarService: SnackbarService,
    private memberService: MembersService,
    private dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.loadMembers();
  }

  loadMembers = () => {
    this.memberService.getMembers().subscribe({
      next: (members) => {
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
      this.dataSourceMat.data;
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
    setTimeout(() => {
      if (this.paginator && this.sort) {
        this.dataSourceMat.paginator = this.paginator;
        this.dataSourceMat.sort = this.sort;
        this.sort.sortChange.emit();
      }
    });
  }

  getNestedValue(member: any, key: string): any {
    return key.split('.').reduce((o, k) => (o || {})[k], member);
  }

  addNewMembers = (): void => {
    const dialogRef = this.dialog.open(MemberComponent, {
      width: 'auto',
      minWidth: '70dvw',
      maxWidth: '100dvw',
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

  editMembers = (member: Members): void => {
    const dialogRef = this.dialog.open(MemberComponent, {
      width: 'auto',
      minWidth: '70dvw',
      maxWidth: '100dvw',
      height: 'auto',
      maxHeight: '100dvh',
      role: 'dialog',
      panelClass: 'dialog',
      disableClose: true,
      id: member.id,
      data: { members: member },
    });

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
      .subscribe((result) => {
        if (result) {
          this.loading.show();
          this.memberService.deleteMember(members.id).subscribe({
            next: () => {
              this.snackbarService.openSuccess(MESSAGES.DELETE_SUCCESS);
              this.loadMembers();
            },
            error: () => {
              this.loading.hide();
              this.snackbarService.openError(MESSAGES.DELETE_ERROR);
            },
            complete: () => this.loading.hide(),
          });
        }
      });
  };
}
