import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  constructor() {}
  private activeTabIndex = new BehaviorSubject<number>(0);
  activeTabIndex$ = this.activeTabIndex.asObservable();

  setActiveTab(index: number) {
    this.activeTabIndex.next(index);
  }

  nextTab() {
    const currentIndex = this.activeTabIndex.getValue();
    this.setActiveTab(currentIndex < 5 ? currentIndex + 1 : currentIndex);
  }

  previousTab() {
    const currentIndex = this.activeTabIndex.getValue();
    this.setActiveTab(currentIndex > 0 ? currentIndex - 1 : currentIndex);
  }
}
