import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { CoreService } from 'app/services/core/core.service';

@Component({
  selector: 'app-logo',
  templateUrl: './logo.component.html',
  styleUrls: ['./logo.component.scss'],
  standalone: true,
  imports: [MatButtonModule],
})
export class LogoComponent implements OnInit {
  constructor(private core: CoreService) {}

  ngOnInit() {}

  goTo() {
    this.core.handleHome();
  }
}
