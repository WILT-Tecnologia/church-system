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
import { MatDialog } from '@angular/material/dialog';
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
import { NotFoundRegisterComponent } from 'app/components/not-found-register/not-found-register.component';
import { TableComponent } from 'app/components/table/table.component';
import { Families } from 'app/model/Families';
import { MESSAGES } from 'app/service/snackbar/messages';
import { SnackbarService } from 'app/service/snackbar/snackbar.service';
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
    TableComponent,
    NotFoundRegisterComponent,
  ],
})
export class FamiliesComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() families: Families[] = [];
  dataSourceMat = new MatTableDataSource<Families>(this.families);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  columnDefinitions = [
    { key: 'member.person.name', header: 'Membro' },
    { key: 'person.name', header: 'Filiação' },
    { key: 'kinship.name', header: 'Parentesco' },
    { key: 'name', header: 'Nome' },
    { key: 'is_member', header: 'A filiação é membro?', type: 'boolean' },
  ];

  displayedColumns = this.columnDefinitions
    .map((col) => col.key)
    .concat('actions');

  constructor(
    private confirmeService: ConfirmService,
    private loadingService: LoadingService,
    private snackbarService: SnackbarService,
    private familiesService: FamiliesService,
    private dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.loadFamilies();
  }

  loadFamilies() {
    this.loadingService.show();
    this.familiesService.getFamilies().subscribe({
      next: (families) => {
        this.families = families;
        this.dataSourceMat.data = this.families;
      },
      error: () => {
        this.loadingService.hide();
        this.snackbarService.openError(MESSAGES.LOADING_ERROR);
      },
      complete: () => this.loadingService.hide(),
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['families'] && !changes['families'].firstChange) {
      this.dataSourceMat.data = this.families;
    }
    /* if (changes['families'] && changes['families'].currentValue) {
      this.dataSourceMat.data = this.families;
    } */
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

  getNestedValue(obj: any, key: string): any {
    return key.split('.').reduce((acc, part) => acc && acc[part], obj);
  }

  getDefaultMemberId(): string | null {
    if (this.families && this.families.length > 0) {
      return this.families[0]?.member?.id;
    } else {
      return null;
    }
  }

  addNewFamily = (): void => {
    const defaultMemberId = this.getDefaultMemberId();
    if (!defaultMemberId) {
      this.snackbarService.openError(MESSAGES.CREATE_ERROR);
      return;
    }

    const dialogRef = this.dialog.open(FamiliesFormComponent, {
      minWidth: '50dvw',
      maxWidth: '75dvw',
      minHeight: '50dvh',
      maxHeight: '75dvh',
      role: 'dialog',
      panelClass: 'dialog',
      disableClose: true,
      data: {
        familiesComponent: FamiliesFormComponent,
        defaultMemberId: defaultMemberId,
      },
    });

    dialogRef.afterClosed().subscribe((result: Families) => {
      if (result) {
        this.familiesService.getFamily(result.id).subscribe((family) => {
          this.dataSourceMat.data = [...this.dataSourceMat.data, family];
          this.familiesService
            .getFamilyByMemberId(family.member.id)
            .subscribe((families) => {
              this.dataSourceMat.data = families;
            });
          this.dataSourceMat._updateChangeSubscription();
        });
      }
    });
  };

  editFamily = (family: Families): void => {
    const dialogRef = this.dialog.open(FamiliesFormComponent, {
      minWidth: '50dvw',
      maxWidth: '75dvw',
      minHeight: '50dvh',
      maxHeight: '75dvh',
      role: 'dialog',
      panelClass: 'dialog',
      disableClose: true,
      data: { families: family, id: family.id },
    });

    dialogRef.afterClosed().subscribe((result: Families) => {
      if (result) {
        this.familiesService.getFamily(result.id).subscribe((family) => {
          this.dataSourceMat.data = this.dataSourceMat.data.map((f) =>
            f.id === family.id ? family : f,
          );
        });
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
            next: () => {
              this.snackbarService.openSuccess(MESSAGES.DELETE_SUCCESS);
              this.familiesService
                .getFamilyByMemberId(family?.member?.id)
                .subscribe((families) => {
                  this.dataSourceMat.data = families;
                });
            },
            error: () => {
              this.loadingService.hide();
              this.snackbarService.openError(MESSAGES.DELETE_ERROR);
            },
            complete: () => this.loadingService.hide(),
          });
        }
      });
  }
}
