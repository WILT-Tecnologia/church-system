import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
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
import { Members } from 'app/model/Members';
import { Ordination } from 'app/model/Ordination';
import { MESSAGES } from 'app/utils/messages';
import { FormatValuesPipe } from 'app/utils/pipes/format-values.pipe';
import { OrdinationFormComponent } from './ordination-form/ordination-form.component';
import { OrdinationsService } from './ordinations.service';

@Component({
  selector: 'app-ordinations',
  templateUrl: './ordinations.component.html',
  styleUrls: ['./ordinations.component.scss'],
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
    MatCheckboxModule,
    CommonModule,
    NotFoundRegisterComponent,
    FormatValuesPipe,
  ],
})
export class OrdinationsComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() ordination: Ordination[] = [];
  members: Members[] = [];
  dataSourceMat = new MatTableDataSource<Ordination>(this.ordination);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  columnDefinitions = [
    { key: 'member.person.name', header: 'Membros', type: 'string' },
    { key: 'occupation.name', header: 'Ocupação', type: 'string' },
    { key: 'initial_date', header: 'Data Inicial', type: 'date' },
    { key: 'end_date', header: 'Data Final', type: 'date' },
    { key: 'status', header: 'Status', type: 'boolean' },
  ];

  displayedColumns = this.columnDefinitions
    .map((col) => col.key)
    .concat('actions');

  constructor(
    private confirmeService: ConfirmService,
    private loadingService: LoadingService,
    private toast: ToastService,
    private ordinationService: OrdinationsService,
    private modalService: ModalService,
  ) {}

  ngOnInit() {
    this.loadOrdinations();
    this.loadMembers();
  }

  loadMembers = () => {
    this.ordinationService.getMembers().subscribe({
      next: (members) => {
        this.members = members;
      },
      error: () => this.toast.openError(MESSAGES.LOADING_ERROR),
    });
  };

  loadOrdinations = () => {
    this.loadingService.show();
    this.ordinationService.getOrdinations().subscribe({
      next: (ordination) => {
        this.ordination = ordination;
        this.dataSourceMat.data = this.ordination;
        this.dataSourceMat.paginator = this.paginator;
        this.dataSourceMat.sort = this.sort;
      },
      error: () => {
        this.loadingService.hide();
        this.toast.openError(MESSAGES.LOADING_ERROR);
      },
      complete: () => this.loadingService.hide(),
    });
  };

  getNestedValue(obj: any, key: string): any {
    return key.split('.').reduce((o, k) => (o ? o[k] : null), obj);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['ordination'] && !changes['ordination'].firstChange) {
      this.dataSourceMat.data = this.ordination;
    }
  }

  ngAfterViewInit() {
    this.dataSourceMat.paginator = this.paginator;
    this.dataSourceMat.sort = this.sort;
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

  getDefaultMemberId(): string | null {
    console.log('getDefaultMemberId:', this.ordination[0]?.id);
    return this.ordination.length > 0 ? this.ordination[0].id : null;
  }

  openModalAddOrdination = () => {
    return this.modalService.openModal(
      `modal-${Math.random()}`,
      OrdinationFormComponent,
      'Adicionar ordinação',
      true,
      [],
      true,
    );
  };

  addNewOrdination = (): void => {
    const defaultMemberId = this.getDefaultMemberId();
    if (!defaultMemberId) {
      this.toast.openError(
        'Nenhum membro encontrado para associar à ordenação.',
      );
      return;
    }

    this.modalService
      .openModal(
        `modal-${Math.random()}`,
        OrdinationFormComponent,
        'Adicionar ordinação',
        true,
        [],
        true,
        {
          ordination: { member: { id: defaultMemberId } } as Ordination,
        },
        'dialog',
      )
      .afterClosed()
      .subscribe({
        next: (ordination: Ordination) => {
          if (ordination) {
            this.ordination = [...this.ordination, ordination];
            this.dataSourceMat.data = this.ordination;
            this.loadOrdinations();
          }
        },
        error: () => {
          this.loadingService.hide();
          this.toast.openError(MESSAGES.CREATE_ERROR);
        },
        complete: () => this.loadingService.hide(),
      });
  };

  editOrdination = (ordination: Ordination): void => {
    this.modalService
      .openModal(
        `modal-${Math.random()}`,
        OrdinationFormComponent,
        'Editar ordinação',
        true,
        [],
        true,
        {
          ordination: ordination,
          id: ordination.id,
        },
        'dialog',
      )
      .afterClosed()
      .subscribe((result: Ordination) => {
        if (result) {
          this.loadingService.show();
          this.ordinationService.getOrdinationById(ordination.id).subscribe({
            next: (updatedOrdination: Ordination) => {
              this.loadingService.show();
              const index = this.ordination.findIndex(
                (o) => o.id === updatedOrdination.id,
              );
              if (index >= 0) {
                this.ordination[index] = updatedOrdination;
                this.dataSourceMat.data = this.ordination; // Atualiza diretamente a tabela
              }
              this.toast.openSuccess(MESSAGES.UPDATE_SUCCESS);
              this.loadOrdinations(); // Sincroniza os dados com o backend
            },
            error: () => {
              this.loadingService.hide();
              this.toast.openError(MESSAGES.DELETE_ERROR);
            },
            complete: () => this.loadingService.hide(),
          });
        }
      });
  };

  deleteOrdination = (ordination: Ordination): void => {
    const nameOrdination =
      ordination?.member?.person?.name + ' | ' + ordination?.occupation?.name;
    this.confirmeService
      .openConfirm(
        'Excluir ordinação',
        `Tem certeza que deseja excluir esta ordinação? ${nameOrdination}`,
        'Confirmar',
        'Cancelar',
      )
      .afterClosed()
      .subscribe((result: Ordination) => {
        if (result) {
          this.loadingService.show();
          this.ordinationService.deleteOrdination(ordination.id).subscribe({
            next: () => {
              this.toast.openSuccess(MESSAGES.DELETE_SUCCESS);
              this.ordinationService
                .getOrdinationByMemberId(ordination?.member?.id)
                .subscribe((ordination) => {
                  this.dataSourceMat.data = ordination;
                });
              this.loadOrdinations();
            },
            error: () => {
              this.loadingService.hide();
              this.toast.openError(MESSAGES.DELETE_ERROR);
            },
            complete: () => this.loadingService.hide(),
          });
        }
      });
  };
}
