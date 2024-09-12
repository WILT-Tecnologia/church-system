import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  constructor() {}
  private current = new BehaviorSubject<number>(0);
  currentStep$ = this.current.asObservable();

  setActiveTab(index: number) {
    this.current.next(index);
  }

  nextTab() {
    const currentIndex = this.current.getValue();
    this.setActiveTab(currentIndex < 5 ? currentIndex + 1 : currentIndex);
  }

  previousTab() {
    const currentIndex = this.current.getValue();
    this.setActiveTab(currentIndex > 0 ? currentIndex - 1 : currentIndex);
  }
}
