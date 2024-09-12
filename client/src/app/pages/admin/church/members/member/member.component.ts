import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MemberFormComponent } from './member-form/member-form.component';

@Component({
  selector: 'app-member',
  templateUrl: './member.component.html',
  styleUrls: ['./member.component.scss'],
  standalone: true,
  imports: [MatTabsModule, MatCardModule, CommonModule, MemberFormComponent],
})
export class MemberComponent implements OnInit {
  isEditMode: boolean = false;

  constructor() {}

  ngOnInit() {}

  get pageTitle() {
    return this.isEditMode ? `Editar membro` : `Cadastrar membro`;
  }
}
