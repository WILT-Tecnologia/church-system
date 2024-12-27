import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ActionsComponent } from 'app/components/actions/actions.component';

@Component({
  selector: 'app-user-form',
  standalone: true,
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss',
  imports: [
    MatButtonModule,
    MatInputModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatDividerModule,
    MatIconModule,
    ReactiveFormsModule,
    CommonModule,
    ActionsComponent,
  ],
})
export class UserFormComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
