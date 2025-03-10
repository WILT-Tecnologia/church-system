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
      const churchesStr = localStorage.getItem('churches');
      if (churchesStr) {
        this.churches = JSON.parse(churchesStr);
      }

      if (this.churches.length === 0) {
        this.router.navigate(['/login']);
      } else if (this.churches.length === 1) {
        this.selectChurch(this.churches[0]);
      }

      this.selectedChurchId = localStorage.getItem('selectedChurch');
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

  selectChurch(church: Church): Promise<boolean> {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('selectedChurch', church.id);
    }
    return this.router.navigateByUrl('/church');
  }

  clearSelectedChurch(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('selectedChurch');
    }
    this.selectedChurchId = null;
  }
}
