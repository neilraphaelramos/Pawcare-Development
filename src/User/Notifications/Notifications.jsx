import React, { useState } from 'react';
import './Notifications.css';

const systemAlertsData = [
  {
    id: 1,
    type: 'Temperature',
    message: 'Buddy’s temperature is above normal: 39.5°C',
    timestamp: 'Just now',
  },
  {
    id: 2,
    type: 'Movement',
    message: 'Unusual movement detected for Whiskers at 2:15 AM.',
    timestamp: '5 minutes ago',
  },
];

const remindersData = [
  {
    id: 101,
    type: 'Appointment',
    message: 'Checkup for Buddy on May 30, 2025 at 9:00 AM.',
    timestamp: 'Tomorrow',
  },
  {
    id: 102,
    type: 'Vaccination',
    message: 'Whiskers is due for Feline Distemper vaccine on June 2, 2025.',
    timestamp: 'In 1 week',
  },
];

function NotificationCard({ notification, onDismiss }) {
  return (
    <div className="notification-card">
      <div className="notification-content">
        <strong className="type-label">{notification.type}</strong>
        <p>{notification.message}</p>
        <span className="timestamp">{notification.timestamp}</span>
      </div>
      <button className="dismiss-btn" onClick={() => onDismiss(notification.id)}>✕</button>
    </div>
  );
}

export default function Notifications() {
  const [systemAlerts, setSystemAlerts] = useState(systemAlertsData);
  const [reminders, setReminders] = useState(remindersData);

  const dismissSystemAlert = (id) => {
    setSystemAlerts(prev => prev.filter(n => n.id !== id));
  };

  const dismissReminder = (id) => {
    setReminders(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="notifications-container">
      <h2 className="user-notifications-title">Notifications</h2>
      <div className="notifications-grid">
        <section className="reminders-section">
          <h3 className="notif-section-title">Reminders</h3>
          {reminders.length === 0 ? (
            <p className="empty-text">No upcoming reminders.</p>
          ) : (
            <div className="notification-list">
              {reminders.map(n => (
                <NotificationCard key={n.id} notification={n} onDismiss={dismissReminder} />
              ))}
            </div>
          )}
        </section>

        <section className="alerts-section">
          <h3 className="notif-section-title">System Alerts</h3>
          {systemAlerts.length === 0 ? (
            <p className="empty-text">No active alerts.</p>
          ) : (
            <div className="notification-list">
              {systemAlerts.map(n => (
                <NotificationCard key={n.id} notification={n} onDismiss={dismissSystemAlert} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
