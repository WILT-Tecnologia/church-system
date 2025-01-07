import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { Router } from '@angular/router';
import { Church } from 'app/model/Church';

@Component({
  selector: 'app-select-church',
  standalone: true,
  templateUrl: './select-church.component.html',
  styleUrl: './select-church.component.scss',
  imports: [MatDialogModule, MatListModule, MatButtonModule, MatDividerModule],
})
export class SelectChurchComponent implements OnInit {
  churches: Church[] = [];
  selectedChurchId: string | null = null;

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.selectedChurchId = localStorage.getItem('selectedChurch');
      const churches = JSON.parse(localStorage.getItem('churches') || '[]');

      if (churches.length > 0) {
        this.churches = churches;

        if (this.selectedChurchId) {
          const selectedChurch = this.churches.find(
            (church) => church.id === this.selectedChurchId,
          );
          if (!selectedChurch) {
            this.clearSelectedChurch();
          }
        }
      }
    }
  }

  selectChurch(church: Church): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('selectedChurch', church.id);
    }
    this.router.navigate(['/church']);
  }

  clearSelectedChurch(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('selectedChurch');
    }
    this.selectedChurchId = null;
  }
}
