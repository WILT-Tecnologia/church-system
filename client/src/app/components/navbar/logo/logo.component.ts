import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-logo',
  templateUrl: './logo.component.html',
  styleUrls: ['./logo.component.scss'],
  standalone: true,
  imports: [MatButtonModule],
})
export class LogoComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit() {}

  goTo() {
    this.router.navigateByUrl('/');
  }
}
