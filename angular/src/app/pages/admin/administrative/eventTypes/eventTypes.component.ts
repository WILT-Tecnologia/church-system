import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmService } from 'app/components/confirm/confirm.service';
import { LoadingService } from 'app/components/loading/loading.service';
import { NotFoundRegisterComponent } from '../../../../components/not-found-register/not-found-register.component';
import { TableComponent } from '../../../../components/table/table.component';
import { EventTypes } from '../../../../model/EventTypes';
import { SnackbarService } from '../../../../service/snackbar/snackbar.service';
import { EventTypeComponent } from './eventType/eventType.component';
import { EventTypesService } from './eventTypes.service';

@Component({
  selector: 'app-eventTypes',
  templateUrl: './eventTypes.component.html',
  styleUrls: ['./eventTypes.component.scss'],
  standalone: true,
  imports: [
    TableComponent,
    MatCardModule,
    MatButtonModule,
    NotFoundRegisterComponent,
    CommonModule,
  ],
})
export class EventTypesComponent implements OnInit {
  eventTypes: EventTypes[] = [];
  displayedColumns: string[] = ['name', 'description', 'status', 'actions'];
  columnDefinitions = {
    name: 'Nome',
    description: 'Descricão',
    status: 'Situação',
    actions: 'Ações',
  };

  constructor(
    private eventTypesService: EventTypesService,
    private snackbarService: SnackbarService,
    private loading: LoadingService,
    private confirmService: ConfirmService,
    private dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.loadEventTypes();
  }

  loadEventTypes = () => {
    this.eventTypesService.getEventTypes().subscribe((eventTypes) => {
      this.eventTypes = eventTypes;
    });
  };

  addNewEventTypes = (): void => {
    const dialogRef = this.dialog.open(EventTypeComponent, {
      maxWidth: '100%',
      height: 'auto',
      maxHeight: '100dvh',
      role: 'dialog',
      panelClass: 'dialog',
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((newEventType) => {
      if (newEventType) {
        this.loading.show();
        this.loadEventTypes();
        this.loading.hide();
      }
    });
  };

  editEventTypes = (eventType: EventTypes): void => {
    const dialogRef = this.dialog.open(EventTypeComponent, {
      id: eventType.id,
      maxWidth: '100%',
      height: 'auto',
      maxHeight: '100dvh',
      role: 'dialog',
      panelClass: 'dialog',
      disableClose: true,
      data: { eventType },
    });
    dialogRef.afterClosed().subscribe((updatedEventType) => {
      if (updatedEventType) {
        this.loading.show();
        this.loadEventTypes();
        this.loading.hide();
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
              this.snackbarService.openSuccess(
                'Tipo de evento excluído com sucesso!',
              );
              this.loadEventTypes();
            },
            error: () => {
              this.loading.hide();
              this.snackbarService.openError(
                'Erro ao excluir o tipo de evento. Tente novamente mais tarde.',
              );
            },
            complete: () => {
              this.loading.hide();
            },
          });
        }
      });
  };
}
