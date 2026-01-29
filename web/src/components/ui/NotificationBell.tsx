import React from 'react';
import { useWebNotifications } from '../../hooks/useWebNotifications';

export const NotificationBell = ({ userToken }: { userToken: string | null }) => {
  const { notifications, isConnected } = useWebNotifications(userToken);
  const unreadCount = notifications.length;

  return (
    <div style={{ position: 'relative', padding: 8 }}>
      <span style={{ fontSize: 20 }}>🔔</span>
      {isConnected && (
        <span title="Conectado" style={{ position: 'absolute', top: 4, right: 4, width: 10, height: 10, background: '#16a34a', borderRadius: 6, border: '2px solid #fff' }} />
      )}
      {unreadCount > 0 && (
        <div style={{ position: 'absolute', right: -6, top: -6, background: '#ef4444', color: 'white', borderRadius: 9999, padding: '2px 6px', fontSize: 12 }}>
          {unreadCount}
        </div>
      )}
    </div>
  );
};
