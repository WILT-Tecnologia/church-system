import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  constructor() {}

  private loadingSubject = new BehaviorSubject<boolean>(true);
  public loading = this.loadingSubject.asObservable();

  show() {
    setTimeout(() => this.loadingSubject.next(true), 0);
  }

  hide() {
    setTimeout(() => this.loadingSubject.next(false), 0);
  }
}
