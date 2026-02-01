'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCheck, X } from 'lucide-react';
import Link from 'next/link';
import { notificationsApi, Notification } from '../api/notifications';
import { useLanguage } from '../context/LanguageContext';

export default function NotificationBell() {
  const { isRTL } = useLanguage();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const loadNotifications = async () => {
    try {
      const data = await notificationsApi.getAll(20);
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.read).length);
    } catch (_) {}
  };

  const loadCount = async () => {
    try {
      const count = await notificationsApi.getUnreadCount();
      setUnreadCount(count);
    } catch (_) {}
  };

  useEffect(() => {
    loadCount();
    const interval = setInterval(loadCount, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (open) loadNotifications();
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    setLoading(true);
    try {
      await notificationsApi.markAllRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (_) {}
    setLoading(false);
  };

  const handleMarkOneRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (_) {}
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-600"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className={`absolute top-full mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-xl border border-gray-200 z-50 ${
            isRTL ? 'left-0' : 'right-0'
          }`}
        >
          <div className={`flex items-center justify-between p-4 border-b ${isRTL ? 'flex-row-reverse' : ''}`}>
            <h3 className="font-bold text-gray-900">
              {isRTL ? 'الإشعارات' : 'Notifications'}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={loading}
                className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                <CheckCheck className="w-4 h-4" />
                {isRTL ? 'تحديد الكل كمقروء' : 'Mark all read'}
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                {isRTL ? 'لا توجد إشعارات' : 'No notifications'}
              </div>
            ) : (
              notifications.map((n) => (
                <Link
                  key={n.id}
                  href={n.link || '#'}
                  onClick={() => {
                    if (!n.read) handleMarkOneRead(n.id);
                    setOpen(false);
                  }}
                  className={`block p-4 border-b hover:bg-gray-50 transition-colors ${!n.read ? 'bg-primary-50/50' : ''} ${isRTL ? 'text-right' : ''}`}
                >
                  <div className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">{n.title}</p>
                      <p className="text-sm text-gray-600 truncate">{n.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{formatDate(n.createdAt)}</p>
                    </div>
                    {!n.read && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleMarkOneRead(n.id);
                        }}
                        className="p-1 rounded hover:bg-gray-200"
                        title={isRTL ? 'تحديد كمقروء' : 'Mark as read'}
                      >
                        <Check className="w-4 h-4 text-gray-500" />
                      </button>
                    )}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
