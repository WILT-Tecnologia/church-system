import { CommonModule } from '@angular/common';
import { Component, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import {
  MatPaginator,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ConfirmService } from 'app/components/confirm/confirm.service';
import { LoadingService } from 'app/components/loading/loading.service';
import { ModalService } from 'app/components/modal/modal.service';
import { MESSAGES } from 'app/service/snackbar/messages';
import { NotFoundRegisterComponent } from '../../../../components/not-found-register/not-found-register.component';
import { TableComponent } from '../../../../components/table/table.component';
import { Person } from '../../../../model/Person';
import { SnackbarService } from '../../../../service/snackbar/snackbar.service';
import { PersonComponent } from './person/person.component';
import { PersonsService } from './persons.service';

@Component({
  selector: 'app-persons',
  standalone: true,
  templateUrl: './persons.component.html',
  styleUrls: ['./persons.component.scss'],
  imports: [
    MatButtonModule,
    MatTableModule,
    MatSortModule,
    MatDividerModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatTooltipModule,
    TableComponent,
    MatIconModule,
    NotFoundRegisterComponent,
    CommonModule,
  ],
})
export class PersonsComponent implements OnInit {
  persons: Person[] = [];
  totalPersons = 0;
  pageSize = 25;
  pageIndex = 0;
  pageSizeOptions: number[] = [25, 50, 100, 200];
  dataSourceMat = new MatTableDataSource<Person>(this.persons);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  columnDefinitions = [
    { key: 'name', header: 'Nome' },
    { key: 'cpf', header: 'CPF' },
    { key: 'email', header: 'Email' },
    { key: 'birth_date', header: 'Data de Nascimento' },
    { key: 'sex', header: 'Sexo' },
    { key: 'phone_one', header: 'Celular' },
  ];

  displayedColumns = this.columnDefinitions
    .map((col) => col.key)
    .concat('actions');

  constructor(
    private personsService: PersonsService,
    private snackbarService: SnackbarService,
    private loading: LoadingService,
    private confirmService: ConfirmService,
    private modalService: ModalService,
  ) {}

  ngOnInit() {
    this.loadPersons();
  }

  loadPersons = () => {
    this.personsService.getPersons().subscribe({
      next: (response) => {
        this.persons = response;
        this.dataSourceMat.data = this.persons;
        if (this.paginator) {
          this.paginator.length = this.totalPersons;
          this.paginator.pageIndex = this.pageIndex;
          this.paginator.pageSize = this.pageSize;
          this.paginator.pageSizeOptions = this.pageSizeOptions;
        }
      },
      error: () => this.snackbarService.openError(MESSAGES.LOADING_ERROR),
      complete: () => this.loading.hide(),
    });
  };

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    //this.loadPersons();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value
      .trim()
      .toLowerCase();

    this.dataSourceMat.data = this.persons.filter((person: Person) => {
      return Object.values(person).some((value) =>
        value?.toString().toLowerCase().includes(filterValue),
      );
    });

    if (this.dataSourceMat.paginator) {
      this.dataSourceMat.paginator.firstPage();
    }
  }

  ngAfterViewInit() {
    this.dataSourceMat.paginator = this.paginator;
    this.dataSourceMat.sort = this.sort;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['persons'] && changes['persons'].currentValue) {
      this.dataSourceMat.data = this.persons;
      this.dataSourceMat.paginator = this.paginator;
      this.dataSourceMat.paginator.pageSize = this.pageSize;
      this.dataSourceMat.paginator.pageIndex = this.pageIndex;
    }
  }

  getNestedValue(member: any, key: string): any {
    return key.split('.').reduce((o, k) => (o ? o[k] : null), member);
  }

  addNewPerson = (): void => {
    const dialogRef = this.modalService.openModal(
      `modal-${Math.random()}`,
      PersonComponent,
      'Adicionar pessoa',
      true,
      [],
      true,
      {},
    );

    dialogRef.afterClosed().subscribe((newPerson) => {
      if (newPerson) this.loadPersons();
    });
  };

  editPerson = (person: Person): void => {
    const dialogRef = this.modalService.openModal(
      `modal-${Math.random()}`,
      PersonComponent,
      'Editar pessoa',
      true,
      [],
      true,
      { person },
    );

    dialogRef.afterClosed().subscribe((updatedPerson) => {
      if (updatedPerson) this.loadPersons();
    });
  };

  deletePerson = (person: Person): void => {
    this.confirmService
      .openConfirm(
        'Atenção',
        'Você tem certeza que deseja excluir o registro?',
        'Confirmar',
        'Cancelar',
      )
      .afterClosed()
      .subscribe((result: Person) => {
        if (result) {
          this.loading.show();
          this.personsService.deletePerson(person.id).subscribe({
            next: () => {
              this.snackbarService.openSuccess(MESSAGES.DELETE_SUCCESS);
              this.loadPersons();
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
