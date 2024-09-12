import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoadingComponent } from './components/loading/loading.component';
import { LoadingService } from './components/loading/loading.service';
import { NavbarComponent } from './components/navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [RouterOutlet, NavbarComponent, LoadingComponent, CommonModule],
})
export class AppComponent {
  title = 'church-system';
  isLoggedIn = false;

  constructor(private loadingService: LoadingService) {}

  ngOnInit() {
    this.loadingService.show();

    this.isLoggedIn = true;

    //this.isLoggedIn = !!localStorage.getItem('access_token') && !this.jwtHelper.isTokenExpired(localStorage.getItem('access_token'));

    setTimeout(() => {
      this.loadingService.hide();
    });
  }
}
