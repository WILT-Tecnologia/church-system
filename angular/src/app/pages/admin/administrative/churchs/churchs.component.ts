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
import { MatSelectModule } from '@angular/material/select';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ConfirmService } from 'app/components/confirm/confirm.service';
import { LoadingService } from 'app/components/loading/loading.service';
import { ModalService } from 'app/components/modal/modal.service';
import { ToastService } from 'app/components/toast/toast.service';
import { MESSAGES } from 'app/utils/messages';
import { FormatValuesPipe } from 'app/utils/pipes/format-values.pipe';
import { NotFoundRegisterComponent } from '../../../../components/not-found-register/not-found-register.component';
import { Church } from '../../../../model/Church';
import { ChurchComponent } from './church/church.component';
import { ChurchsService } from './churchs.service';

@Component({
  selector: 'app-churchs',
  templateUrl: './churchs.component.html',
  styleUrls: ['./churchs.component.scss'],
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
    FormatValuesPipe,
  ],
})
export class ChurchsComponent implements OnInit, AfterViewInit, OnChanges {
  churchs: Church[] = [];
  pageSizeOptions: number[] = [25, 50, 100, 200];
  pageSize: number = 25;
  dataSourceMat = new MatTableDataSource<Church>(this.churchs);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  columnDefinitions = [
    { key: 'responsible.name', header: 'Responsável', type: 'string' },
    { key: 'name', header: 'Nome', type: 'string' },
    { key: 'email', header: 'Email', type: 'string' },
    { key: 'cnpj', header: 'CNPJ', type: 'cnpj' },
  ];

  displayedColumns = this.columnDefinitions
    .map((col) => col.key)
    .concat('actions');

  constructor(
    private churchsService: ChurchsService,
    private toast: ToastService,
    private loading: LoadingService,
    private confirmService: ConfirmService,
    private modalService: ModalService,
  ) {}

  ngOnInit() {
    this.loadChurch();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['churchs'] && changes['churchs'].currentValue) {
      this.dataSourceMat.data = this.churchs;
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

  loadChurch = () => {
    this.loading.show();
    this.churchsService.getChurch().subscribe({
      next: (churchs) => {
        this.churchs = churchs;
        this.dataSourceMat.data = this.churchs;
        this.dataSourceMat.paginator = this.paginator;
        this.dataSourceMat.sort = this.sort;
      },
      error: () => this.toast.openError(MESSAGES.LOADING_ERROR),
      complete: () => this.loading.hide(),
    });
  };

  addNewChurch = (): void => {
    const dialogRef = this.modalService.openModal(
      `modal-${Math.random()}`,
      ChurchComponent,
      'Adicionar igreja',
      true,
      [],
      true,
    );

    dialogRef.afterClosed().subscribe((church: Church) => {
      if (church) {
        this.loadChurch();
      }
    });
  };

  editChurch = (church: Church): void => {
    const dialogRef = this.modalService.openModal(
      `modal-${Math.random()}`,
      ChurchComponent,
      'Editar igreja',
      true,
      [],
      true,
      { church },
    );

    dialogRef.afterClosed().subscribe((church: Church) => {
      if (church) {
        this.loadChurch();
      }
    });
  };

  deleteChurch = (church: Church): void => {
    this.confirmService
      .openConfirm(
        'Atenção',
        `Você tem certeza que deseja excluir o registro ${church.name}?`,
        'Confirmar',
        'Cancelar',
      )
      .afterClosed()
      .subscribe((church: Church) => {
        if (church) {
          this.churchsService.deleteChurch(church.id).subscribe({
            next: () => {
              this.toast.openSuccess(MESSAGES.DELETE_SUCCESS);
              this.loadChurch();
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
