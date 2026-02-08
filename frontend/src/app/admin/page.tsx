'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import {
  Shield,
  Lock,
  Eye,
  EyeOff,
  Building2,
  Users,
  Wifi,
  WifiOff,
  Trash2,
  ChevronDown,
  ChevronUp,
  Globe,
  Loader2,
  RefreshCw,
  Search,
  User,
  Clock,
  LogOut,
} from 'lucide-react';

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  lastActivity?: string;
  isOnline: boolean;
  createdAt: string;
}

interface Organization {
  id: string;
  name: string;
  createdAt: string;
  isOnline: boolean;
  membersCount: number;
  members: Member[];
}

interface Stats {
  totalOrganizations: number;
  onlineOrganizations: number;
  totalUsers: number;
  onlineUsers: number;
}

export default function AdminPage() {
  const { isRTL, language, setLanguage } = useLanguage();

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  // Data state
  const [stats, setStats] = useState<Stats | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedOrg, setExpandedOrg] = useState<string | null>(null);
  const [filterOnline, setFilterOnline] = useState(false);

  // Check saved admin session
  useEffect(() => {
    const savedPass = sessionStorage.getItem('admin_pass');
    if (savedPass) {
      setPassword(savedPass);
      setIsAuthenticated(true);
    }
  }, []);

  // Auto-fetch when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
      // Auto-refresh every 30 seconds
      const interval = setInterval(fetchData, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const pass = sessionStorage.getItem('admin_pass') || password;
      const res = await fetch('/api/admin/organizations', {
        headers: { Authorization: `Admin ${pass}` },
      });

      if (res.status === 401) {
        setIsAuthenticated(false);
        sessionStorage.removeItem('admin_pass');
        setAuthError(isRTL ? 'كلمة المرور غير صحيحة' : 'Invalid password');
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setOrganizations(data.organizations);
      }
    } catch (err) {
      console.error('Failed to fetch admin data');
    } finally {
      setLoading(false);
    }
  }, [password, isRTL]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (!password) {
      setAuthError(isRTL ? 'أدخل كلمة المرور' : 'Enter password');
      return;
    }

    // Verify by making API call
    const res = await fetch('/api/admin/organizations', {
      headers: { Authorization: `Admin ${password}` },
    });

    if (res.status === 401) {
      setAuthError(isRTL ? 'كلمة المرور غير صحيحة' : 'Invalid password');
      return;
    }

    if (res.ok) {
      sessionStorage.setItem('admin_pass', password);
      setIsAuthenticated(true);
      const data = await res.json();
      setStats(data.stats);
      setOrganizations(data.organizations);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_pass');
    setIsAuthenticated(false);
    setPassword('');
    setStats(null);
    setOrganizations([]);
  };

  const handleDeleteOrg = async (orgId: string, orgName: string) => {
    const msg = isRTL 
      ? `هل أنت متأكد من حذف "${orgName}"؟ سيتم حذف جميع البيانات المرتبطة بها!`
      : `Are you sure you want to delete "${orgName}"? All related data will be deleted!`;
    
    if (!confirm(msg)) return;

    // Double confirm
    const msg2 = isRTL 
      ? `تأكيد نهائي: هل تريد حذف "${orgName}"؟ لا يمكن التراجع!`
      : `Final confirmation: Delete "${orgName}"? This cannot be undone!`;
    
    if (!confirm(msg2)) return;

    try {
      const pass = sessionStorage.getItem('admin_pass') || password;
      const res = await fetch(`/api/admin/organizations/${orgId}`, {
        method: 'DELETE',
        headers: { Authorization: `Admin ${pass}` },
      });

      if (res.ok) {
        setOrganizations(organizations.filter(o => o.id !== orgId));
        if (stats) {
          setStats({
            ...stats,
            totalOrganizations: stats.totalOrganizations - 1,
          });
        }
      } else {
        const data = await res.json();
        alert(data.error || (isRTL ? 'فشل في الحذف' : 'Failed to delete'));
      }
    } catch (err) {
      alert(isRTL ? 'حدث خطأ' : 'An error occurred');
    }
  };

  const getTimeAgo = (dateStr?: string) => {
    if (!dateStr) return isRTL ? 'غير متاح' : 'N/A';
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return isRTL ? 'الآن' : 'Just now';
    if (minutes < 60) return isRTL ? `منذ ${minutes} دقيقة` : `${minutes}m ago`;
    if (hours < 24) return isRTL ? `منذ ${hours} ساعة` : `${hours}h ago`;
    return isRTL ? `منذ ${days} يوم` : `${days}d ago`;
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-100 text-purple-700';
      case 'manager': return 'bg-blue-100 text-blue-700';
      case 'employee': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, { ar: string; en: string }> = {
      owner: { ar: 'مالك', en: 'Owner' },
      manager: { ar: 'مدير', en: 'Manager' },
      employee: { ar: 'موظف', en: 'Employee' },
    };
    return isRTL ? labels[role]?.ar : labels[role]?.en;
  };

  const filteredOrgs = organizations.filter(o => {
    const matchSearch = o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.members.some(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          m.email.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchOnline = !filterOnline || o.isOnline;
    return matchSearch && matchOnline;
  });

  const texts = {
    adminPanel: isRTL ? 'لوحة الإدارة' : 'Admin Panel',
    login: isRTL ? 'تسجيل الدخول' : 'Login',
    password: isRTL ? 'كلمة المرور' : 'Password',
    enterPassword: isRTL ? 'أدخل كلمة مرور الأدمن' : 'Enter admin password',
    totalOrgs: isRTL ? 'إجمالي المنظمات' : 'Total Organizations',
    onlineOrgs: isRTL ? 'منظمات نشطة' : 'Online Organizations',
    totalUsers: isRTL ? 'إجمالي المستخدمين' : 'Total Users',
    onlineUsers: isRTL ? 'مستخدمين نشطين' : 'Online Users',
    search: isRTL ? 'بحث بالاسم أو الإيميل...' : 'Search by name or email...',
    all: isRTL ? 'الكل' : 'All',
    onlineOnly: isRTL ? 'النشطة فقط' : 'Online Only',
    members: isRTL ? 'أعضاء' : 'members',
    member: isRTL ? 'عضو' : 'member',
    online: isRTL ? 'نشط' : 'Online',
    offline: isRTL ? 'غير نشط' : 'Offline',
    delete: isRTL ? 'حذف المنظمة' : 'Delete Organization',
    lastActive: isRTL ? 'آخر نشاط' : 'Last active',
    createdAt: isRTL ? 'تاريخ الإنشاء' : 'Created',
    noOrgs: isRTL ? 'لا توجد منظمات' : 'No organizations found',
    refresh: isRTL ? 'تحديث' : 'Refresh',
    logout: isRTL ? 'خروج' : 'Logout',
    autoRefresh: isRTL ? 'تحديث تلقائي كل 30 ثانية' : 'Auto-refresh every 30s',
  };

  // LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">{texts.adminPanel}</h1>
            <p className="text-gray-400 mt-2 text-sm">
              {isRTL ? 'أدخل كلمة المرور للوصول' : 'Enter password to access'}
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-700">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">{texts.password}</label>
              <div className="relative">
                <Lock className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 ${isRTL ? 'right-3' : 'left-3'}`} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={texts.enterPassword}
                  className={`w-full bg-gray-700 border border-gray-600 rounded-xl py-3 text-white 
                             placeholder-gray-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 
                             outline-none transition-colors ${isRTL ? 'pr-11 pl-11' : 'pl-11 pr-11'}`}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 ${isRTL ? 'left-3' : 'right-3'}`}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {authError && (
              <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg">
                <p className="text-sm text-red-400">{authError}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl 
                         transition-colors flex items-center justify-center gap-2"
            >
              <Shield className="w-5 h-5" />
              {texts.login}
            </button>

            {/* Language Toggle */}
            <button
              type="button"
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="w-full mt-3 py-2 text-gray-400 hover:text-gray-300 text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <Globe className="w-4 h-4" />
              {language === 'ar' ? 'English' : 'العربية'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ADMIN DASHBOARD
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-white">{texts.adminPanel}</h1>
                <p className="text-xs text-gray-400">{texts.autoRefresh}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Globe className="w-4 h-4" />
                {language === 'ar' ? 'EN' : 'AR'}
              </button>
              <button
                onClick={fetchData}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                {texts.refresh}
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                {texts.logout}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-900/50 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.totalOrganizations}</p>
                  <p className="text-xs text-gray-400">{texts.totalOrgs}</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-900/50 rounded-lg flex items-center justify-center">
                  <Wifi className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-400">{stats.onlineOrganizations}</p>
                  <p className="text-xs text-gray-400">{texts.onlineOrgs}</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-900/50 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
                  <p className="text-xs text-gray-400">{texts.totalUsers}</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-900/50 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-400">{stats.onlineUsers}</p>
                  <p className="text-xs text-gray-400">{texts.onlineUsers}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 ${isRTL ? 'right-3' : 'left-3'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={texts.search}
              className={`w-full bg-gray-800 border border-gray-700 rounded-xl py-2.5 text-white 
                         placeholder-gray-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 
                         outline-none transition-colors ${isRTL ? 'pr-11' : 'pl-11'}`}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterOnline(false)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${!filterOnline ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
            >
              {texts.all} ({organizations.length})
            </button>
            <button
              onClick={() => setFilterOnline(true)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2
                ${filterOnline ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
            >
              <Wifi className="w-4 h-4" />
              {texts.onlineOnly} ({organizations.filter(o => o.isOnline).length})
            </button>
          </div>
        </div>

        {/* Organizations List */}
        {loading && organizations.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
          </div>
        ) : filteredOrgs.length === 0 ? (
          <div className="text-center py-20">
            <Building2 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500">{texts.noOrgs}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrgs.map((org) => (
              <div key={org.id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                {/* Org Header */}
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-750"
                  onClick={() => setExpandedOrg(expandedOrg === org.id ? null : org.id)}
                >
                  <div className="flex items-center gap-4">
                    {/* Online Indicator */}
                    <div className={`w-3 h-3 rounded-full ${org.isOnline ? 'bg-green-500 shadow-lg shadow-green-500/50' : 'bg-gray-600'}`} />
                    
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-white text-lg">{org.name}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                          ${org.isOnline ? 'bg-green-900/50 text-green-400' : 'bg-gray-700 text-gray-500'}`}>
                          {org.isOnline ? texts.online : texts.offline}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {org.membersCount} {org.membersCount === 1 ? texts.member : texts.members}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {texts.createdAt}: {new Date(org.createdAt).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Delete Button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteOrg(org.id, org.name); }}
                      className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-900/30 rounded-lg transition-colors"
                      title={texts.delete}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    {/* Expand/Collapse */}
                    {expandedOrg === org.id 
                      ? <ChevronUp className="w-5 h-5 text-gray-500" />
                      : <ChevronDown className="w-5 h-5 text-gray-500" />
                    }
                  </div>
                </div>

                {/* Members List (Expanded) */}
                {expandedOrg === org.id && (
                  <div className="border-t border-gray-700 p-4">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-gray-400 border-b border-gray-700">
                            <th className={`pb-3 font-medium ${isRTL ? 'text-right' : 'text-left'}`}>
                              {isRTL ? 'الاسم' : 'Name'}
                            </th>
                            <th className={`pb-3 font-medium ${isRTL ? 'text-right' : 'text-left'}`}>
                              {isRTL ? 'الإيميل' : 'Email'}
                            </th>
                            <th className={`pb-3 font-medium ${isRTL ? 'text-right' : 'text-left'}`}>
                              {isRTL ? 'الدور' : 'Role'}
                            </th>
                            <th className={`pb-3 font-medium ${isRTL ? 'text-right' : 'text-left'}`}>
                              {isRTL ? 'الحالة' : 'Status'}
                            </th>
                            <th className={`pb-3 font-medium ${isRTL ? 'text-right' : 'text-left'}`}>
                              {texts.lastActive}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {org.members.map((member) => (
                            <tr key={member.id} className="border-b border-gray-700/50 last:border-0">
                              <td className="py-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                                    <span className="text-sm font-medium text-gray-300">
                                      {member.name.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                  <span className="text-white font-medium">{member.name}</span>
                                </div>
                              </td>
                              <td className="py-3 text-gray-400">{member.email}</td>
                              <td className="py-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadge(member.role)}`}>
                                  {getRoleLabel(member.role)}
                                </span>
                              </td>
                              <td className="py-3">
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${member.isOnline ? 'bg-green-500' : 'bg-gray-600'}`} />
                                  <span className={`text-xs ${member.isOnline ? 'text-green-400' : 'text-gray-500'}`}>
                                    {member.isOnline ? texts.online : texts.offline}
                                  </span>
                                </div>
                              </td>
                              <td className="py-3 text-gray-400 text-xs">
                                {getTimeAgo(member.lastActivity)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
