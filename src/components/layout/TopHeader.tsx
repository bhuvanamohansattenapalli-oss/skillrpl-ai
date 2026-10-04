import React, { useState } from 'react';
import {
  Menu,
  Bell,
  Search,
  Sun,
  Moon
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface TopHeaderProps {
  onToggleSidebar: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ onToggleSidebar }) => {
  const {
    notifications,
    setIsNotificationsDrawerOpen,
    showToast
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length || 1;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      showToast(`Searching for "${searchQuery}" across skill catalog...`, 'info');
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    showToast(isDarkMode ? 'Switched to Light Mode' : 'Switched to Dark Ambient Mode', 'info');
  };

  return (
    <header
      className="top-header"
      style={{
        height: '68px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        gap: '20px'
      }}
    >
      {/* Left: Mobile Sidebar Toggle */}
      <button
        onClick={onToggleSidebar}
        aria-label="Toggle navigation menu"
        className="mobile-menu-btn"
        style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.9)',
          color: '#123B5D',
          cursor: 'pointer',
          boxShadow: '0 2px 6px rgba(11, 41, 66, 0.05)'
        }}
      >
        <Menu size={20} />
      </button>

      {/* Center/Left: Large Glass Search Pill */}
      <form
        onSubmit={handleSearch}
        style={{
          flex: '1',
          maxWidth: '540px',
          position: 'relative',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: '16px',
            display: 'flex',
            alignItems: 'center',
            pointerEvents: 'none',
            color: '#7e93a8'
          }}
        >
          <Search size={17} />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search skills, assessments, opportunities..."
          style={{
            width: '100%',
            height: '42px',
            padding: '0 18px 0 44px',
            borderRadius: '9999px',
            background: 'rgba(255, 255, 255, 0.82)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.95)',
            boxShadow: '0 4px 18px rgba(18, 59, 93, 0.04), inset 0 1px 1px rgba(255, 255, 255, 0.8)',
            fontSize: '13.5px',
            color: '#0f2744',
            outline: 'none',
            transition: 'all 0.2s ease'
          }}
          className="search-pill-input"
        />
      </form>

      {/* Right Controls: Theme Capsule + Notification Bell */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginLeft: 'auto' }}>
        {/* Dark Theme Capsule Toggle */}
        <button
          onClick={toggleTheme}
          title="Toggle Color Theme"
          style={{
            height: '38px',
            padding: '0 6px',
            borderRadius: '9999px',
            background: '#091326',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 4px 14px rgba(4, 15, 36, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer'
          }}
        >
          <div
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isDarkMode ? '#94a3b8' : '#ffffff',
              background: isDarkMode ? 'transparent' : 'rgba(255, 255, 255, 0.15)',
              transition: 'all 0.2s ease'
            }}
          >
            <Sun size={15} />
          </div>
          <div
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isDarkMode ? '#ffffff' : '#94a3b8',
              background: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
              transition: 'all 0.2s ease'
            }}
          >
            <Moon size={14} />
          </div>
        </button>

        {/* Notification Bell Button with Red Badge */}
        <button
          onClick={() => setIsNotificationsDrawerOpen(true)}
          title="Notifications"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.82)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.95)',
            boxShadow: '0 4px 14px rgba(18, 59, 93, 0.05), inset 0 1px 1px #ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#123B5D',
            cursor: 'pointer',
            position: 'relative'
          }}
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: '#ef4444',
                color: '#ffffff',
                fontSize: '10.5px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(239, 68, 68, 0.5), inset 0 1px 1px #ffffff'
              }}
            >
              1
            </span>
          )}
        </button>
      </div>

      <style>{`
        .search-pill-input:focus {
          background: #FFFFFF !important;
          border-color: #38bdf8 !important;
          box-shadow: 0 4px 20px rgba(56, 189, 248, 0.2), inset 0 1px 1px #ffffff !important;
        }
      `}</style>
    </header>
  );
};
