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
import { MatBadgeModule } from '@angular/material/badge';
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
import { Members, StatusMember } from 'app/model/Members';
import { MESSAGES } from 'app/utils/messages';
import { FormatValuesPipe } from 'app/utils/pipes/format-values.pipe';
import { MembersService } from '../../members.service';
import { MemberService } from '../member.service';
import { StatusMemberFormComponent } from './status-member-form/status-member-form.component';
import { StatusMemberService } from './status-member.service';

@Component({
  selector: 'app-status-member',
  standalone: true,
  templateUrl: './status-member.component.html',
  styleUrl: './status-member.component.scss',
  imports: [
    MatBadgeModule,
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
export class StatusMemberComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() statusMember: StatusMember[] = [];
  members: Members[] = [];
  dataSourceMat = new MatTableDataSource<StatusMember>(this.statusMember);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  columnDefinitions = [
    { key: 'member.person.name', header: 'Membro', type: 'string' },
    {
      key: 'member_situation.name',
      header: 'Situação do membro',
      type: 'string',
    },
    { key: 'initial_period', header: 'Data Inicial', type: 'date' },
    { key: 'final_period', header: 'Data Final', type: 'date' },
  ];

  displayedColumns = this.columnDefinitions
    .map((col) => col.key)
    .concat('actions');

  constructor(
    private confirmeService: ConfirmService,
    private loadingService: LoadingService,
    private toast: ToastService,
    private modalService: ModalService,
    private statusMemberService: StatusMemberService,
    private memberService: MemberService,
    private membersService: MembersService,
  ) {}

  ngOnInit(): void {
    this.loadStatusMember();
  }

  loadMembers = () => {
    this.loadingService.show();
    this.membersService.getMembers().subscribe({
      next: (members) => {
        this.members = members;
      },
      error: () => this.toast.openError(MESSAGES.LOADING_ERROR),
      complete: () => this.loadingService.hide(),
    });
  };

  loadStatusMember = () => {
    this.loadingService.show();
    const memberId = this.memberService.getEditingMemberId();
    this.statusMemberService.getStatusMemberFromMembers(memberId!).subscribe({
      next: (statusMember) => {
        this.statusMember = statusMember;
        this.dataSourceMat.data = this.statusMember;
        this.dataSourceMat.paginator = this.paginator;
        this.dataSourceMat.sort = this.sort;
      },
      error: () => this.toast.openError(MESSAGES.LOADING_ERROR),
      complete: () => this.loadingService.hide(),
    });
  };

  getBadgeClass(status: string): string {
    switch (status) {
      case 'Membro ativo':
        return 'badge-ativo';
      case 'Frequentador':
        return 'badge-frequentador';
      case 'Membro em disciplina':
        return 'badge-disciplina';
      case 'Inativo':
        return 'badge-inativo';
      case 'Falecido':
        return 'badge-falecido';
      default:
        return 'badge-ativo';
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['statusMember'] && !changes['statusMember'].firstChange) {
      this.dataSourceMat.data = this.statusMember;
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

  addNewStatusMember = () => {
    const defaultMemberId = this.memberService.getEditingMemberId();

    const dialogRef = this.modalService.openModal(
      `modal-${Math.random()}`,
      StatusMemberFormComponent,
      'Adicionar situação no membro',
      true,
      [],
      true,
      { statusMember: { member: { id: defaultMemberId } } as StatusMember },
      'dialog',
    );

    dialogRef.afterClosed().subscribe((result: StatusMember) => {
      if (result) {
        this.loadStatusMember();
      }
    });
  };

  editStatusMember = (statusMember: StatusMember) => {
    const dialogRef = this.modalService.openModal(
      `modal-${Math.random()}`,
      StatusMemberFormComponent,
      'Editar situação no membro',
      true,
      [],
      true,
      { statusMember: statusMember, id: statusMember.id },
      'dialog',
    );

    dialogRef.afterClosed().subscribe((result: StatusMember) => {
      if (result) {
        this.loadStatusMember();
      }
    });
  };

  deleteStatusMember = (statusMember: StatusMember) => {
    const dialogRef = this.confirmeService.openConfirm(
      'Excluir situação do membro',
      'Tem certeza que deseja excluir essa situação do membro?',
      'Confirmar',
      'Cancelar',
    );

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadingService.show();
        this.statusMemberService.deleteStatusMember(statusMember.id).subscribe({
          next: () => this.toast.openSuccess(MESSAGES.DELETE_SUCCESS),
          error: () => {
            this.loadingService.hide();
            this.toast.openError(MESSAGES.DELETE_ERROR);
          },
          complete: () => {
            this.loadStatusMember();
            this.loadingService.hide();
          },
        });
      }
    });
  };
}
