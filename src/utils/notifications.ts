export const isNotificationSupported = (): boolean => {
  return typeof window !== 'undefined' && 'Notification' in window;
};

export const getNotificationPermission = (): NotificationPermission => {
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
};

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!isNotificationSupported()) return 'denied';
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.error('Failed to request notification permission:', err);
    return 'denied';
  }
};

export const pushOverduePlantNotification = async (
  plantName: string, 
  taskType: string, 
  dueLabel: string
): Promise<boolean> => {
  if (!isNotificationSupported()) {
    console.warn('Browser notifications are not supported in this environment.');
    return false;
  }

  let perm = Notification.permission;
  if (perm === 'default') {
    perm = await requestNotificationPermission();
  }

  if (perm === 'granted') {
    try {
      const notification = new Notification(`🌱 Plant Care Overdue: ${plantName}`, {
        body: `${plantName} is marked as OVERDUE for ${taskType.toLowerCase()} care! (${dueLabel})`,
        icon: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAMs7i8Y4S80_ZfK8P5jGk1_0d0x9vY-R4pEaK32f01QpT',
        tag: `overdue-${plantName}-${Date.now()}`,
      });
      return true;
    } catch (err) {
      console.error('Error creating browser notification:', err);
    }
  }
  return false;
};
