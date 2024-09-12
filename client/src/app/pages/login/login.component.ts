import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { LoginService } from './login.service';

type Credentials = {
  login: string;
  password: string;
};

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatSnackBarModule,
  ],
  //providers: [AuthService],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  constructor(private loginService: LoginService) {}

  credentials: Credentials = {
    login: 'thiagopersch@gmail.com',
    password: '12345678',
  };

  form = new FormGroup({
    login: new FormControl(this.credentials.login, [
      Validators.required,
      Validators.email,
    ]),
    password: new FormControl(this.credentials.password, [
      Validators.required,
      Validators.minLength(8),
      Validators.maxLength(20),
    ]),
  });

  ngOnInit(): void {}

  onSubmit() {
    if (this.form.valid) {
      const credentials = {
        login: this.form.get('login')?.value as string,
        password: this.form.get('password')?.value as string,
      };
      return this.loginService.login(credentials);
    }
  }
}
