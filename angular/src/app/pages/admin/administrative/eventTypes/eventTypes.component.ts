import { CommonModule } from '@angular/common';
import { Component, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ConfirmService } from 'app/components/confirm/confirm.service';
import { LoadingService } from 'app/components/loading/loading.service';
import { ToastService } from 'app/components/toast/toast.service';

import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ModalService } from 'app/components/modal/modal.service';
import { NotFoundRegisterComponent } from 'app/components/not-found-register/not-found-register.component';
import { EventTypes } from 'app/model/EventTypes';
import { MESSAGES } from 'app/utils/messages';
import { FormatValuesPipe } from 'app/utils/pipes/format-values.pipe';
import { EventTypeComponent } from './eventType/eventType.component';
import { EventTypesService } from './eventTypes.service';

@Component({
  selector: 'app-eventTypes',
  templateUrl: './eventTypes.component.html',
  styleUrls: ['./eventTypes.component.scss'],
  standalone: true,
  imports: [
    MatTableModule,
    MatSortModule,
    MatDividerModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    NotFoundRegisterComponent,
    CommonModule,
    FormatValuesPipe,
  ],
})
export class EventTypesComponent implements OnInit {
  eventTypes: EventTypes[] = [];
  pageSizeOptions: number[] = [25, 50, 100, 200];
  pageSize: number = 25;
  dataSourceMat = new MatTableDataSource<EventTypes>(this.eventTypes);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  columnDefinitions = [
    { key: 'status', header: 'Status', type: 'boolean' },
    { key: 'name', header: 'Nome', type: 'string' },
    { key: 'description', header: 'Descrição', type: 'string' },
    { key: 'updated_at', header: 'Atualizado em', type: 'datetime' },
  ];

  displayedColumns = this.columnDefinitions
    .map((col) => col.key)
    .concat('actions');

  constructor(
    private eventTypesService: EventTypesService,
    private toast: ToastService,
    private loading: LoadingService,
    private confirmService: ConfirmService,
    private modalService: ModalService,
  ) {}

  ngOnInit() {
    this.loadEventTypes();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['eventTypes'] && changes['eventTypes'].currentValue) {
      this.dataSourceMat.data = this.eventTypes;
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

  loadEventTypes = () => {
    this.eventTypesService.getEventTypes().subscribe({
      next: (eventTypes) => {
        this.eventTypes = eventTypes;
        this.dataSourceMat.data = this.eventTypes;
        this.dataSourceMat.paginator = this.paginator;
        this.dataSourceMat.sort = this.sort;
      },
      error: () => this.toast.openError(MESSAGES.LOADING_ERROR),
      complete: () => this.loading.hide(),
    });
  };

  addNewEventTypes = (): void => {
    const dialogRef = this.modalService.openModal(
      `modal-${Math.random()}`,
      EventTypeComponent,
      'Adicionar tipo de evento',
      true,
      [],
      true,
      {},
    );

    dialogRef.afterClosed().subscribe((newEventType) => {
      if (newEventType) {
        this.loadEventTypes();
      }
    });
  };

  editEventTypes = (eventType: EventTypes): void => {
    const dialogRef = this.modalService.openModal(
      `modal-${Math.random()}`,
      EventTypeComponent,
      'Editar tipo de evento',
      true,
      [],
      true,
      { eventType },
    );

    dialogRef.afterClosed().subscribe((newEventType) => {
      if (newEventType) {
        this.loadEventTypes();
      }
    });
  };

  deleteEventTypes = (eventType: EventTypes): void => {
    this.confirmService
      .openConfirm(
        'Atenção!',
        'Tem certeza que deseja excluir este tipo de evento?',
        'Confirmar',
        'Cancelar',
      )
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          this.eventTypesService.deleteEventTypes(eventType.id).subscribe({
            next: () => {
              this.toast.openSuccess(MESSAGES.DELETE_SUCCESS);
            },
            error: () => {
              this.loading.hide();
              this.toast.openError(MESSAGES.DELETE_ERROR);
            },
            complete: () => {
              this.loadEventTypes();
              this.loading.hide();
            },
          });
        }
      });
  };
}
