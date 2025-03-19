import React, { useState, useEffect, useRef } from 'react';
import { useStore } from './store';

export const GameNotification = () => {
  const [notification, setNotification] = useState(null);
  const { playActive, playEnded, downs } = useStore();
  const prevPossessionRef = useRef(downs.possession);
  
  // Listen for state changes to trigger notifications
  useEffect(() => {
    // Track possession changes
    if (prevPossessionRef.current !== downs.possession) {
      // Possession has changed, show notification
      if (downs.possession === "defense" && downs.position !== 20) {
        setNotification({
          message: "DEFENSE TAKES OVER!",
          type: "turnover"
        });
      } else if (downs.possession === "offense" && downs.position !== 20) {
        setNotification({
          message: "OFFENSE TAKES OVER!",
          type: "turnover"
        });
      }
      
      // Update the ref
      prevPossessionRef.current = downs.possession;
    }
    // Show "First Down" notification when appropriate
    else if (downs.current === 1 && downs.toGo === 10 && !playActive && playEnded) {
      // Skip when it's just the initial state
      if (downs.position !== 20) {
        setNotification({
          message: "FIRST DOWN!",
          type: "first-down"
        });
      }
    }
    
    // Show "Touchdown" notification
    else if (downs.position >= 100) {
      setNotification({
        message: "TOUCHDOWN!",
        type: "touchdown"
      });
    }
    
    // Clear notification after display time
    const timer = setTimeout(() => {
      setNotification(null);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [downs, playActive, playEnded]);
  
  if (!notification) return null;
  
  // Use UI assets
  const getNotificationIcon = () => {
    switch(notification.type) {
      case 'first-down':
        return '/ui/icon_checkmark.png';
      case 'touchdown':
        return '/ui/star.png';
      case 'turnover':
        return '/ui/icon_repeat_light.png';
      default:
        return '';
    }
  };
  
  // Use Kenney UI assets for notification background
  const bgImage = notification.type === 'touchdown' 
    ? "/ui/button_green.png" 
    : notification.type === 'turnover'
      ? "/ui/button_red.png"
      : "/ui/button_rectangle_depth_gradient.png";
      
  return (
    <div 
      className={`notification ${notification.type}-notification`}
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: '100% 100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '15px 30px'
      }}
    >
      <img 
        src={getNotificationIcon()} 
        alt="" 
        style={{width: 24, height: 24, marginRight: 10}}
      />
      {notification.message}
    </div>
  );
};