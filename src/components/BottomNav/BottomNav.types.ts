export interface BottomNavProps {
  currentPath: string;
  showProfileModal: boolean;
  setShowProfileModal: (show: boolean) => void;
  navigate: (path: string) => void;
  wishlistCount: number;
  enquiryCount: number;
  orderCount: number;
  notificationCount?: number;
  onNotificationClick?: () => void;
}
