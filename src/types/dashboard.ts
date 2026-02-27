export interface IUser {
  id: string;
  _id: string;
  name?: string;
  username: string;
  email: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
  lastLogin?: string;
  lastLogout?: string;
  createdBy?: string;
}

export interface IAdminStats {
  totalUsers: number;
  activeUsers: number;
  securityAlerts: number;
  systemUptime: string;
}

export interface INotification {
  id: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}
