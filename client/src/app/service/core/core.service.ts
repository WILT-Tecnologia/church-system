import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class CoreService {
  constructor(private router: Router, private route: ActivatedRoute) {}

  handleBack = () => {
    this.router.navigate(['../'], { relativeTo: this.route });
  };
}
