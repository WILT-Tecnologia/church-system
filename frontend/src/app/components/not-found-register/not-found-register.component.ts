import { Component, input, OnInit, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-not-found-register',
  templateUrl: './not-found-register.component.html',
  styleUrls: ['./not-found-register.component.scss'],
  imports: [MatButtonModule],
})
export class NotFoundRegisterComponent implements OnInit {
  ctaLabel = input<string>('Adicionar');
  add = output<void>();

  constructor() {}

  ngOnInit() {}
}
