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
import { MemberService } from '../member.service';
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
    { key: 'status', header: 'Status', type: 'boolean' },
    { key: 'member.person.name', header: 'Membro', type: 'string' },
    { key: 'occupation.name', header: 'Ocupação', type: 'string' },
    { key: 'initial_date', header: 'Data Inicial', type: 'date' },
    { key: 'end_date', header: 'Data Final', type: 'date' },
  ];

  displayedColumns = this.columnDefinitions
    .map((col) => col.key)
    .concat('actions');

  constructor(
    private confirmeService: ConfirmService,
    private loadingService: LoadingService,
    private toast: ToastService,
    private modalService: ModalService,
    private ordinationService: OrdinationsService,
    private memberService: MemberService,
  ) {}

  ngOnInit() {
    this.loadOrdinations();
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
    const memberId = this.memberService.getEditingMemberId();
    this.ordinationService.getOrdinationByMemberId(memberId!).subscribe({
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

  openModalAddOrdination = () => {
    return this.modalService.openModal(
      `modal-${Math.random()}`,
      OrdinationFormComponent,
      'Adicionar ordinação',
      true,
      true,
      {},
      'dialog',
    );
  };

  addNewOrdination = (): void => {
    const defaultMemberId = this.memberService.getEditingMemberId();

    const dialogRef = this.modalService.openModal(
      `modal-${Math.random()}`,
      OrdinationFormComponent,
      'Adicionar ordinação',
      true,
      true,
      {
        ordination: { member: { id: defaultMemberId } } as Ordination,
      },
      'dialog',
    );

    dialogRef.afterClosed().subscribe((result: Ordination) => {
      if (result) {
        this.loadOrdinations();
      }
    });
  };

  editOrdination = (ordination: Ordination): void => {
    const dialogRef = this.modalService.openModal(
      `modal-${Math.random()}`,
      OrdinationFormComponent,
      'Editar ordinação',
      true,
      true,
      {
        ordination: ordination,
        id: ordination.id,
      },
      'dialog',
    );

    dialogRef.afterClosed().subscribe((result: Ordination) => {
      if (result) {
        this.loadOrdinations();
      }
    });
  };

  deleteOrdination = (ordination: Ordination): void => {
    const nameOrdination =
      ordination?.member?.person?.name + ' | ' + ordination?.occupation?.name;
    const dialogRef = this.confirmeService.openConfirm(
      'Excluir ordinação',
      `Tem certeza que deseja excluir esta ordinação? ${nameOrdination}`,
      'Confirmar',
      'Cancelar',
    );

    dialogRef.afterClosed().subscribe((result: Ordination) => {
      if (result) {
        this.loadingService.show();
        this.ordinationService.deleteOrdination(ordination.id).subscribe({
          next: () => this.toast.openSuccess(MESSAGES.DELETE_SUCCESS),
          error: () => {
            this.loadingService.hide();
            this.toast.openError(MESSAGES.DELETE_ERROR);
          },
          complete: () => {
            this.loadOrdinations();
            this.loadingService.hide();
          },
        });
      }
    });
  };
}
