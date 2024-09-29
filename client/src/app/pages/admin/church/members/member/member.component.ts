import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MemberFormComponent } from './member-form/member-form.component';

@Component({
  selector: 'app-member',
  templateUrl: './member.component.html',
  styleUrls: ['./member.component.scss'],
  standalone: true,
  imports: [
    MatTabsModule,
    MatIconModule,
    MatDividerModule,
    MatCardModule,
    CommonModule,
    MemberFormComponent,
  ],
})
export class MemberComponent implements OnInit {
  isEditMode: boolean = false;

  constructor(private dialog: MatDialog) {}

  ngOnInit() {}

  handleBack() {
    this.dialog.closeAll();
  }

  get pageTitle() {
    return this.isEditMode ? `Editaando o membro` : `Cadastrar o membro`;
  }
}
