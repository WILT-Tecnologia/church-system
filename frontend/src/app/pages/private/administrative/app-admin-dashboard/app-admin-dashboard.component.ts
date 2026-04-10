import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ColumnComponent } from '@app/components/column/column.component';
import { DashboardStatsService } from '@app/pages/private/administrative/app-admin-dashboard/dashboard-stats.service';
import { ChurchListStatsComponent } from '@app/pages/private/administrative/app-admin-dashboard/shared/church-list-stats/church-list-stats.component';
import { ChurchStatsComponent } from '@app/pages/private/administrative/app-admin-dashboard/shared/church-stats/church-stats.component';
import { DashboardHeaderComponent } from '@app/pages/private/administrative/app-admin-dashboard/shared/dashboard-header/dashboard-header.component';
import {
  ChurchStats,
  DashboardStats,
} from '@app/pages/private/administrative/app-admin-dashboard/shared/types';
import { UserStatsComponent } from '@app/pages/private/administrative/app-admin-dashboard/shared/user-stats/user-stats.component';
import { ChurchesService } from '@app/pages/private/administrative/churches/churches.service';
import { UsersService } from '@app/pages/private/administrative/users/users.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './app-admin-dashboard.component.html',
  styleUrls: ['./app-admin-dashboard.component.scss'],
  imports: [
    DashboardHeaderComponent,
    UserStatsComponent,
    ColumnComponent,
    ChurchStatsComponent,
    ChurchListStatsComponent,
  ],
})
export class AdminDashboardComponent implements OnInit {
  dashboardStats = signal<DashboardStats>({
    totalUsers: 0,
    totalUsersActive: 0,
    totalNewUsers: 0,
    totalUsersActiviedPercentage: 0,
    totalUsersPercentage: 0,
    totalNewUsersPercentage: 0,
  });

  churchStats = signal<ChurchStats>({
    totalChurches: 0,
    totalChurchPercentage: 0,
    totalNewChurches: 0,
    totalNewChurchPercentage: 0,
  });

  private usersService = inject(UsersService);
  private churchesService = inject(ChurchesService);
  private statsService = inject(DashboardStatsService);
  private router = inject(Router);

  ngOnInit() {
    this.loadData();
  }

  private loadData() {
    const users$ = this.usersService.getUsers();
    const churches$ = this.churchesService.getChurches();

    forkJoin([users$, churches$]).subscribe(([users, churches]) => {
      const stats = this.statsService.calculateUserStats(users);
      const churchData = this.statsService.calculateChurchStats(churches);

      this.dashboardStats.set(stats);
      this.churchStats.set(churchData);
    });
  }

  accessRoute(pathName: string) {
    this.router.navigate([pathName]);
  }
}
