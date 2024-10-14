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
import { Families } from 'app/model/Families';
import { MESSAGES } from 'app/service/snackbar/messages';
import { SnackbarService } from 'app/service/snackbar/snackbar.service';
import { NotFoundRegisterComponent } from '../../../../../../components/not-found-register/not-found-register.component';
import { TableComponent } from '../../../../../../components/table/table.component';
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
    MatFormFieldModule,
    FamiliesFormComponent,
    CommonModule,
    TableComponent,
    NotFoundRegisterComponent,
  ],
})
export class FamiliesComponent implements OnInit, AfterViewInit, OnChanges {
  families: Families[] = [];
  pageSizeOptions: number[] = [25, 50, 100, 200];
  pageSize: number = 25;
  dataSourceMat = new MatTableDataSource<Families>(this.families);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  columnDefinitions = [
    { key: 'member.person.name', header: 'Membro' },
    { key: 'person.name', header: 'Filiação' },
    { key: 'kinship.name', header: 'Parentesco' },
    { key: 'name', header: 'Nome' },
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
    this.familiesService.getFamilies().subscribe({
      next: (families) => {
        this.families = families;
        this.dataSourceMat.data = this.families;
        this.dataSourceMat.paginator = this.paginator;
        this.dataSourceMat.sort = this.sort;
      },
      error: (error) => {
        this.snackbarService.openError(error.message);
      },
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['dataSource'] && changes['dataSource'].currentValue) {
      this.dataSourceMat.data;
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
    setTimeout(() => {
      if (this.paginator && this.sort) {
        this.dataSourceMat.paginator = this.paginator;
        this.dataSourceMat.sort = this.sort;
        this.sort.sortChange.emit();
      }
    });
  }

  getNestedValue(obj: any, key: string): any {
    return key.split('.').reduce((acc, part) => acc && acc[part], obj);
  }

  addNewFamily = (): void => {
    const dialogRef = this.dialog.open(FamiliesFormComponent, {
      maxWidth: '100dvw',
      height: 'auto',
      maxHeight: '100dvh',
      role: 'dialog',
      panelClass: 'dialog',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadFamilies();
      }
    });
  };

  editFamily = (family: Families): void => {
    const dialogRef = this.dialog.open(FamiliesFormComponent, {
      maxWidth: '100dvw',
      height: 'auto',
      maxHeight: '100dvh',
      role: 'dialog',
      panelClass: 'dialog',
      disableClose: true,
      id: family.id,
      data: { families: family },
    });

    dialogRef.afterClosed().subscribe((result: Families) => {
      if (result) {
        this.loadFamilies();
      }
    });
  };

  deleteFamily(family: Families) {
    this.confirmeService
      .openConfirm(
        'Excluir o parentesco',
        `Tem certeza que deseja excluir o parentesco ?`,
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
              this.loadFamilies();
            },
            error: () => {
              this.loadingService.hide();
              this.snackbarService.openError(MESSAGES.DELETE_ERROR);
            },
            complete: () => {
              this.loadingService.hide();
            },
          });
        }
      });
  }
}
