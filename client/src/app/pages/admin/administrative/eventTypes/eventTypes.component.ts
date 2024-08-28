import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { SnackbarService } from './../../../../service/snackbar/snackbar.service';

import { Router } from '@angular/router';
import { NotFoundRegisterComponent } from '../../../../components/not-found-register/not-found-register.component';
import { TableComponent } from '../../../../components/table/table.component';
import { EventTypes } from '../../../../model/EventTypes';
import { EventTypesService } from './eventTypes.service';

@Component({
  selector: 'app-eventTypes',
  standalone: true,
  templateUrl: './eventTypes.component.html',
  styleUrls: ['./eventTypes.component.scss'],
  imports: [
    TableComponent,
    MatCardModule,
    MatButtonModule,
    NotFoundRegisterComponent,
    CommonModule,
  ],
})
export class EventTypesComponent implements OnInit {
  constructor(
    private router: Router,
    private snackbarService: SnackbarService,
    private eventTypesService: EventTypesService
  ) {}

  ngOnInit() {
    this.loadEventTypes();
  }

  eventTypes: EventTypes[] = [];
  displayedColumns: string[] = ['name', 'description', 'status', 'actions'];
  columnDefinitions = {
    name: 'Nome',
    description: 'Descricão',
    status: 'Situação',
    actions: 'Ações',
  };

  loadEventTypes = () => {
    this.eventTypesService.getEventTypes().subscribe((eventTypes) => {
      this.eventTypes = eventTypes;
    });
  };

  addNewEventTypes = (): void => {
    this.router.navigate(['administrative/eventTypes/eventType/new']);
  };

  editEventTypes = (eventType: EventTypes): void => {
    this.router.navigate([
      'administrative/eventTypes/eventType/edit',
      eventType.id,
    ]);
  };

  deleteEventTypes = (eventType: EventTypes): void => {
    this.eventTypesService.deleteEventTypes(eventType.id).subscribe({
      next: () => {
        this.snackbarService.openSuccess(
          'Tipo de evento excluído com sucesso!'
        );
      },
      error: () => {
        this.snackbarService.openError(
          'Erro ao excluir o tipo de evento. Tente novamente mais tarde.'
        );
      },
    });
  };
}
