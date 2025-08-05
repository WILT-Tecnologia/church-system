import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-not-found-register',
  templateUrl: './not-found-register.component.html',
  styleUrls: ['./not-found-register.component.scss'],
  imports: [MatButtonModule],
})
export class NotFoundRegisterComponent implements OnInit {
  @Input() ctaLabel: string = 'Adicionar';
  @Output() add = new EventEmitter<void>();

  constructor() {}

  ngOnInit() {}
}
