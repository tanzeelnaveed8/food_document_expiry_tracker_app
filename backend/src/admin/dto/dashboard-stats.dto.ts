export class DashboardStatsDto {
  users: {
    total: number;
    active: number;
    inactive: number;
    premium: number;
    premiumPercentage: number;
  };

  items: {
    total: number;
    food: number;
    documents: number;
    expired: number;
    expiringSoon: number;
  };

  notifications: {
    sentToday: number;
    sentThisWeek: number;
    deliveryRate: number;
    failedToday: number;
  };

  growth: {
    newUsersToday: number;
    newUsersThisWeek: number;
    newUsersThisMonth: number;
  };
}
