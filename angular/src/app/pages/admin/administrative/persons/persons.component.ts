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
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ConfirmService } from 'app/components/confirm/confirm.service';
import { LoadingService } from 'app/components/loading/loading.service';
import { ModalService } from 'app/components/modal/modal.service';
import { NotFoundRegisterComponent } from 'app/components/not-found-register/not-found-register.component';
import { ToastService } from 'app/components/toast/toast.service';
import { Person } from 'app/model/Person';
import { MESSAGES } from 'app/utils/messages';
import { FormatValuesPipe } from 'app/utils/pipes/format-values.pipe';
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
    MatIconModule,
    NotFoundRegisterComponent,
    CommonModule,
    FormatValuesPipe,
  ],
})
export class PersonsComponent implements OnInit, AfterViewInit, OnChanges {
  persons: Person[] = [];
  pageSizeOptions: number[] = [25, 50, 100, 200];
  pageSize: number = 25;
  dataSourceMat = new MatTableDataSource<Person>(this.persons);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  columnDefinitions = [
    { key: 'name', header: 'Nome', type: 'string' },
    { key: 'cpf', header: 'CPF', type: 'cpf' },
    { key: 'email', header: 'Email', type: 'string' },
    { key: 'birth_date', header: 'Data de Nascimento', type: 'date' },
    { key: 'sex', header: 'Sexo', type: 'sex' },
    { key: 'phone_one', header: 'Celular', type: 'phone' },
  ];

  displayedColumns = this.columnDefinitions
    .map((col) => col.key)
    .concat('actions');

  constructor(
    private personsService: PersonsService,
    private toast: ToastService,
    private loading: LoadingService,
    private confirmService: ConfirmService,
    private modalService: ModalService,
  ) {}

  ngOnInit() {
    this.loadPersons();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['persons'] && changes['persons'].currentValue) {
      this.dataSourceMat.data = this.persons;
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

  loadPersons = () => {
    this.personsService.getPersons().subscribe({
      next: (response) => {
        this.persons = response;
        this.dataSourceMat.data = this.persons;
        this.dataSourceMat.paginator = this.paginator;
        this.dataSourceMat.sort = this.sort;
      },
      error: () => this.toast.openError(MESSAGES.LOADING_ERROR),
      complete: () => this.loading.hide(),
    });
  };

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

    dialogRef.afterClosed().subscribe((person: Person) => {
      if (person) {
        this.loadPersons();
      }
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

    dialogRef.afterClosed().subscribe((person: Person) => {
      if (person) {
        this.loadPersons();
      }
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
      .subscribe((person: Person) => {
        if (person) {
          this.loading.show();
          this.personsService.deletePerson(person.id).subscribe({
            next: () => {
              this.toast.openSuccess(MESSAGES.DELETE_SUCCESS);
            },
            error: () => {
              this.loading.hide();
              this.toast.openError(MESSAGES.DELETE_ERROR);
            },
            complete: () => {
              this.loadPersons();
              this.loading.hide();
            },
          });
        }
      });
  };
}
