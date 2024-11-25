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
import { Families } from 'app/model/Families';
import { MESSAGES } from 'app/utils/messages';
import { FormatValuesPipe } from 'app/utils/pipes/format-values.pipe';
import { MembersService } from '../../members.service';
import { MemberService } from '../member.service';
import { FamiliesFormComponent } from './families-form/families-form.component';
import { FamiliesService } from './families.service';

@Component({
  selector: 'app-families',
  templateUrl: './families.component.html',
  styleUrls: ['./families.component.scss'],
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatTableModule,
    MatSortModule,
    MatDividerModule,
    MatPaginatorModule,
    MatSelectModule,
    MatInputModule,
    MatTooltipModule,
    MatIconModule,
    MatCheckboxModule,
    MatFormFieldModule,
    CommonModule,
    NotFoundRegisterComponent,
    FormatValuesPipe,
  ],
})
export class FamiliesComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() families: Families[] = [];
  dataSourceMat = new MatTableDataSource<Families>(this.families);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  columnDefinitions = [
    { key: 'member.person.name', header: 'Membro', type: 'string' },
    { key: 'person.name', header: 'Filiação', type: 'string' },
    { key: 'kinship.name', header: 'Parentesco', type: 'string' },
    { key: 'name', header: 'Nome', type: 'string' },
    { key: 'is_member', header: 'A filiação é membro?', type: 'boolean' },
  ];

  displayedColumns = this.columnDefinitions
    .map((col) => col.key)
    .concat('actions');

  constructor(
    private confirmeService: ConfirmService,
    private loadingService: LoadingService,
    private toast: ToastService,
    private familiesService: FamiliesService,
    private modalService: ModalService,
    private membersService: MembersService,
    private memberService: MemberService,
  ) {}

  ngOnInit() {
    this.loadFamilies();
  }

  loadFamilies = () => {
    this.loadingService.show();
    const memberId = this.memberService.getEditingMemberId();
    this.membersService.getFamilyOfMemberId(memberId!).subscribe({
      next: (families) => {
        this.families = families;
        this.dataSourceMat.data = this.families;
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
    if (changes['families'] && !changes['families'].firstChange) {
      this.dataSourceMat.data = this.families;
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

  openModalAddFamily = () => {
    return this.modalService.openModal(
      `modal-${Math.random()}`,
      FamiliesFormComponent,
      'Adicionar filiação',
      true,
      [],
      true,
      {},
      'dialog',
    );
  };

  addNewFamily = (): void => {
    const defaultMemberId = this.memberService.getEditingMemberId();

    const dialogRef = this.modalService.openModal(
      `modal-${Math.random()}`,
      FamiliesFormComponent,
      'Adicionar filiação',
      true,
      [],
      true,
      {
        families: { member: { id: defaultMemberId } } as Families,
      },
      'dialog',
    );

    dialogRef.afterClosed().subscribe((result: Families) => {
      if (result) {
        this.loadFamilies();
      }
    });
  };

  editFamily = (family: Families): void => {
    const dialogRef = this.modalService.openModal(
      `modal-${Math.random()}`,
      FamiliesFormComponent,
      'Editar filiação',
      true,
      [],
      true,
      {
        families: family,
        id: family.id,
      },
      'dialog',
    );

    dialogRef.afterClosed().subscribe((result: Families) => {
      if (result) {
        this.loadFamilies();
      }
    });
  };

  deleteFamily(family: Families) {
    const nameFamily = family?.is_member
      ? family?.person?.name + ' | ' + family?.kinship?.name
      : family?.name + ' | ' + family?.kinship?.name;
    this.confirmeService
      .openConfirm(
        'Excluir o parentesco',
        `Tem certeza que deseja excluir o parentesco: ${nameFamily} ?`,
        'Confirmar',
        'Cancelar',
      )
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          this.loadingService.show();
          this.familiesService.deleteFamily(family.id).subscribe({
            next: () => this.toast.openSuccess(MESSAGES.DELETE_SUCCESS),
            error: () => {
              this.loadingService.hide();
              this.toast.openError(MESSAGES.DELETE_ERROR);
            },
            complete: () => {
              this.loadFamilies();
              this.loadingService.hide();
            },
          });
        }
      });
  }
}
