// src/components/NotificationTester.tsx
import React from 'react';
import {
  simulateNewMatchNotification,
  simulateNewMessageNotification,
  simulateNewEventNotification,
  requestNotificationPermission
} from '../services/notificationsService';

const NotificationTester: React.FC = () => {
  const requestPermission = async () => {
    const granted = await requestNotificationPermission();
    alert(`Notification permission ${granted ? 'granted' : 'denied'}`);
  };
  
  return (
    <div className="notification-tester">
      <h3>Test Notifications</h3>
      <div className="test-buttons">
        <button onClick={requestPermission}>
          Request Notification Permission
        </button>
        <button onClick={simulateNewMatchNotification}>
          Test Match Notification
        </button>
        <button onClick={simulateNewMessageNotification}>
          Test Message Notification
        </button>
        <button onClick={simulateNewEventNotification}>
          Test Event Notification
        </button>
      </div>
      <p className="test-info">
        Note: This component is for demonstration purposes only and can be removed in production.
      </p>
      <style jsx>{`
        .notification-tester {
          max-width: 800px;
          margin: 20px auto;
          padding: 15px;
          background-color: var(--card-bg-color);
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        h3 {
          margin-top: 0;
          color: var(--text-color);
        }
        
        .test-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 15px;
        }
        
        button {
          background-color: var(--primary-color);
          color: white;
          border: none;
          padding: 8px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
        }
        
        button:hover {
          background-color: var(--accent-color);
        }
        
        .test-info {
          font-size: 0.8rem;
          color: var(--text-light);
          margin-bottom: 0;
        }
        
        @media (max-width: 600px) {
          .test-buttons {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default NotificationTester;