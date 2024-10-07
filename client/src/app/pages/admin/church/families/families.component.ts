import { CommonModule } from '@angular/common';
import { Component, OnInit, SimpleChanges } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableDataSource } from '@angular/material/table';
import { ConfirmService } from 'app/components/confirm/confirm.service';
import { LoadingService } from 'app/components/loading/loading.service';
import { Families } from 'app/model/Families';
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
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FamiliesFormComponent,
    CommonModule,
  ],
})
export class FamiliesComponent implements OnInit {
  families: Families[] = [];
  dataSourceMat = new MatTableDataSource<Families>(this.families);
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
        this.dataSourceMat = new MatTableDataSource<Families>(this.families);
        this.dataSourceMat.data = this.families;
      },
      error: (error) => {
        this.snackbarService.openError(error.message);
      },
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['dataSource'] && changes['dataSource'].currentValue) {
      this.dataSourceMat.data = this.dataSourceMat.data;
    }
  }

  getNestedValue(member: any, key: string): any {
    return key.split('.').reduce((o, k) => (o || {})[k], member);
  }

  addNewFamily() {
    const dialogRef = this.dialog.open(FamiliesFormComponent, {
      width: '70dvw',
      maxWidth: '100%',
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
  }

  editFamily(family: Families) {
    const dialogRef = this.dialog.open(FamiliesFormComponent, {
      width: '70dvw',
      maxWidth: '100%',
      height: 'auto',
      maxHeight: '100dvh',
      role: 'dialog',
      panelClass: 'dialog',
      disableClose: true,
      data: family,
    });

    dialogRef.afterClosed().subscribe((result: Families) => {
      if (result) {
        this.loadFamilies();
      }
    });
  }

  deleteFamily(family: Families) {
    this.confirmeService
      .openConfirm(
        'Exclusão da familia',
        `Tem certeza que deseja excluir a familia ?`,
        'Confirmar',
        'Cancelar',
      )
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          this.loadingService.show();
          this.familiesService.deleteFamily(family.id).subscribe({
            next: () => {
              this.snackbarService.openSuccess('Familia excluída com sucesso');
              this.loadFamilies();
            },
            error: (error) => {
              this.loadingService.hide();
              this.snackbarService.openError(error.message);
            },
            complete: () => {
              this.loadingService.hide();
            },
          });
        }
      });
  }
}
