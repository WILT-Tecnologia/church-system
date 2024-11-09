import { Component, Input, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-not-found-register',
  standalone: true,
  templateUrl: './not-found-register.component.html',
  styleUrls: ['./not-found-register.component.scss'],
  imports: [MatButtonModule, MatDividerModule],
})
export class NotFoundRegisterComponent implements OnInit {
  @Input() addRegisterFn!: () => void;
  @Input() template: string = '';
  @Input() ctaLabel: string = '';

  constructor() {}

  ngOnInit() {}
}
