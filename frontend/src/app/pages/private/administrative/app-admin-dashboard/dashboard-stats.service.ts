import { Injectable } from '@angular/core';

import { User } from 'app/model/User';

import { ChurchStats, DashboardStats } from './shared/types';

@Injectable({
  providedIn: 'root',
})
export class DashboardStatsService {
  calculateUserStats(users: User[]): DashboardStats {
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const endOfCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
    const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    const totalUsers = users.length;
    const totalUsersActive = users.filter((user) => user.status).length;
    const totalUsersActiviedPercentage = parseFloat(((totalUsersActive / totalUsers) * 100).toFixed(2)) || 0;

    const totalNewUsers = users.filter((user) => {
      const createdAt = new Date(user.created_at);
      return createdAt >= startOfCurrentMonth && createdAt <= endOfCurrentMonth;
    }).length;

    const previousMonthUsers = users.filter((user) => {
      const createdAt = new Date(user.created_at);
      return createdAt >= startOfPreviousMonth && createdAt <= endOfPreviousMonth;
    }).length;

    const totalNewUsersPercentage =
      previousMonthUsers > 0
        ? parseFloat((((totalNewUsers - previousMonthUsers) / previousMonthUsers) * 100).toFixed(2))
        : 0;

    const previousTotalUsers = users.filter((user) => {
      const createdAt = new Date(user.created_at);
      return createdAt <= endOfPreviousMonth;
    }).length;

    const totalUsersPercentage =
      previousTotalUsers > 0
        ? parseFloat((((totalUsers - previousTotalUsers) / previousTotalUsers) * 100).toFixed(2))
        : 0;

    return {
      totalUsers,
      totalUsersActive,
      totalNewUsers,
      totalUsersActiviedPercentage,
      totalUsersPercentage,
      totalNewUsersPercentage,
    };
  }

  calculateChurchStats(churches: any[]): ChurchStats {
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const endOfCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
    const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    const totalChurches = churches.length;

    const totalNewChurches = churches.filter((church) => {
      const createdAt = new Date(church.created_at);
      return createdAt >= startOfCurrentMonth && createdAt <= endOfCurrentMonth;
    }).length;

    const previousMonthChurches = churches.filter((church) => {
      const createdAt = new Date(church.created_at);
      return createdAt >= startOfPreviousMonth && createdAt <= endOfPreviousMonth;
    }).length;

    const totalNewChurchPercentage =
      previousMonthChurches > 0
        ? parseFloat((((totalNewChurches - previousMonthChurches) / previousMonthChurches) * 100).toFixed(2))
        : 0;

    const previousTotalChurches = churches.filter((church) => {
      const createdAt = new Date(church.created_at);
      return createdAt <= endOfPreviousMonth;
    }).length;

    const totalChurchPercentage =
      previousTotalChurches > 0
        ? parseFloat((((totalChurches - previousTotalChurches) / previousTotalChurches) * 100).toFixed(2))
        : 0;

    return {
      totalChurches,
      totalChurchPercentage,
      totalNewChurches,
      totalNewChurchPercentage,
    };
  }
}
