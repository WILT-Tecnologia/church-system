import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { ToastService } from '../../../components/toast/toast.service';
import { DashboardComponent } from './dashboard/dashboard.component';
import { EventsComponent } from './events/events.component';
import { MembersComponent } from './members/members.component';

@Component({
    selector: 'app-church',
    templateUrl: './church.component.html',
    styleUrls: ['./church.component.scss'],
    imports: [
        MatTabsModule,
        MatCardModule,
        MatDividerModule,
        MembersComponent,
        DashboardComponent,
        EventsComponent,
    ]
})
export class ChurchComponent implements OnInit {
  churchId: string | null = null;

  constructor(
    private router: Router,
    private toast: ToastService,
    @Inject(PLATFORM_ID) private platformId: any,
  ) {}

  ngOnInit() {
    this.churchId = localStorage.getItem('selectedChurch');
    if (!this.churchId && isPlatformBrowser(this.platformId)) {
      localStorage.clear();
      this.toast.openError('Nenhuma igreja selecionada.');
      this.router.navigate(['/select-church']);
    }
  }
}
