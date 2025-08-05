import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  constructor() {}

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading = this.loadingSubject.asObservable();

  show() {
    setTimeout(() => this.loadingSubject.next(true));
  }

  hide() {
    setTimeout(() => this.loadingSubject.next(false));
  }

  isLoading(): Observable<boolean> {
    return this.loadingSubject.asObservable();
  }
}
