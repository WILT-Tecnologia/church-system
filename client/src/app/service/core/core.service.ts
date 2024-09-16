import { Location } from '@angular/common';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CoreService {
  constructor(private location: Location) {}
  private memberCreatedSubject = new Subject<string>();
  memberCreated$ = this.memberCreatedSubject.asObservable();

  handleBack = () => {
    this.location.back();
  };

  handleHome = () => {
    this.location.go('');
  };
}
