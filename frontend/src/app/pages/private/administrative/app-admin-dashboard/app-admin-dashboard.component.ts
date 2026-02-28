import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { ColumnComponent } from 'app/components/column/column.component';

import { ChurchsService } from '../churches/churches.service';
import { UsersService } from '../users/users.service';
import { DashboardStatsService } from './dashboard-stats.service';
import { ChurchListStatsComponent } from './shared/church-list-stats/church-list-stats.component';
import { ChurchStatsComponent } from './shared/church-stats/church-stats.component';
import { DashboardHeaderComponent } from './shared/dashboard-header/dashboard-header.component';
import { ChurchStats, DashboardStats } from './shared/types';
import { UserStatsComponent } from './shared/user-stats/user-stats.component';

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
  private churchService = inject(ChurchsService);
  private statsService = inject(DashboardStatsService);
  private router = inject(Router);

  ngOnInit() {
    this.loadData();
  }

  private loadData() {
    const users$ = this.usersService.getUsers();
    const churches$ = this.churchService.getChurch();

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
