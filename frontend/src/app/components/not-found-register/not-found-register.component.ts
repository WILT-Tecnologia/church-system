import { Component, Input, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-not-found-register',
  standalone: true,
  templateUrl: './not-found-register.component.html',
  styleUrls: ['./not-found-register.component.scss'],
  imports: [MatButtonModule],
})
export class NotFoundRegisterComponent implements OnInit {
  @Input() addRegisterFn!: () => void;
  @Input() ctaLabel!: string;

  constructor() {}

  ngOnInit() {}
}
