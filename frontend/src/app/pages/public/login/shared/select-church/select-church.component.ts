import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { Router } from '@angular/router';

import { Church } from 'app/model/Church';
import { ChurchesService } from 'app/pages/private/administrative/churches/churches.service';
import { AuthService } from 'app/services/auth/auth.service';
import { RouteFallbackService } from 'app/services/guards/route-fallback.service';

@Component({
  selector: 'app-select-church',
  templateUrl: './select-church.component.html',
  styleUrl: './select-church.component.scss',
  imports: [MatListModule, MatButtonModule, MatDividerModule],
})
export class SelectChurchComponent implements OnInit {
  churches: Church[] = [];
  selectedChurchId: string | null = null;

  constructor(
    private router: Router,
    private churchesService: ChurchesService,
    private authService: AuthService,
    private routeFallbackService: RouteFallbackService,
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
        const selectedChurch = this.churches.find((church) => church.id === this.selectedChurchId);
        if (!selectedChurch) {
          this.clearSelectedChurch();
        }
      }
    }
  }

  selectChurch(church: Church): Promise<boolean> {
    this.churchesService.setSelectedChurch(church);
    localStorage.setItem('selectedChurch', church.id);

    const permissions = this.authService.getPermissions();
    const firstRoute = this.routeFallbackService.getFirstAllowedRoute(permissions);
    return this.router.navigateByUrl(firstRoute);
  }

  clearSelectedChurch(): void {
    this.churchesService.clearSelectedChurch();
    this.selectedChurchId = null;
  }
}
