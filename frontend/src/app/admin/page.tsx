'use client';

import { useState, useEffect } from 'react';
import {
  Shield,
  Lock,
  Building2,
  Users,
  Wifi,
  WifiOff,
  Trash2,
  RefreshCw,
  Clock,
  Calendar,
  AlertCircle,
  LogOut,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import toast, { Toaster } from 'react-hot-toast';

interface OrganizationMember {
  id: string;
  name: string;
  role: string;
  isOnline: boolean;
  lastActivity: string | null;
}

interface Organization {
  id: string;
  name: string;
  createdAt: string;
  totalMembers: number;
  onlineCount: number;
  lastActivity: string | null;
  members: OrganizationMember[];
}

interface AdminData {
  summary: {
    totalOrganizations: number;
    totalUsers: number;
    totalOnline: number;
    totalOffline: number;
  };
  organizations: Organization[];
}

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AdminData | null>(null);
  const [expandedOrgs, setExpandedOrgs] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);

  // Check for existing admin session
  useEffect(() => {
    const storedToken = sessionStorage.getItem('adminToken');
    if (storedToken) {
      setAdminToken(storedToken);
      setIsAuthenticated(true);
    }
  }, []);

  // Load data when authenticated
  useEffect(() => {
    if (isAuthenticated && adminToken) {
      loadData();
    }
  }, [isAuthenticated, adminToken]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Authentication failed');
      }

      setAdminToken(result.token);
      sessionStorage.setItem('adminToken', result.token);
      setIsAuthenticated(true);
      toast.success('Access granted');
    } catch (error: any) {
      toast.error(error.message || 'Invalid password');
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    if (!adminToken) return;
    
    setRefreshing(true);
    try {
      const response = await fetch('/api/admin/organizations', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to load data');
      }

      setData(result);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load data');
    } finally {
      setRefreshing(false);
    }
  };

  const handleDelete = async (orgId: string, orgName: string) => {
    if (!adminToken) return;
    
    if (!confirm(`Are you sure you want to delete "${orgName}"?\n\nThis will permanently delete:\n- The organization\n- All users\n- All tasks, goals, KPIs\n- All plans and data\n\nThis action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/organizations/${orgId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete organization');
      }

      toast.success(`"${orgName}" deleted successfully`);
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete organization');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminToken');
    setAdminToken(null);
    setIsAuthenticated(false);
    setData(null);
    setPassword('');
  };

  const toggleOrgExpand = (orgId: string) => {
    const newExpanded = new Set(expandedOrgs);
    if (newExpanded.has(orgId)) {
      newExpanded.delete(orgId);
    } else {
      newExpanded.add(orgId);
    }
    setExpandedOrgs(newExpanded);
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center px-4">
        <Toaster position="top-center" />
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <Shield className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Access</h1>
              <p className="text-gray-600 mt-2">Enter the admin password to continue</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Enter admin password"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Access Admin Panel'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              This area is restricted to administrators only.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div className="min-h-screen bg-gray-100">
      <Toaster position="top-center" />
      
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Shield className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-500">Organization Management</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Summary Cards */}
        {data && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{data.summary.totalOrganizations}</p>
                  <p className="text-sm text-gray-500">Organizations</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{data.summary.totalUsers}</p>
                  <p className="text-sm text-gray-500">Total Users</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Wifi className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{data.summary.totalOnline}</p>
                  <p className="text-sm text-gray-500">Online Now</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-100 rounded-lg">
                  <WifiOff className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{data.summary.totalOffline}</p>
                  <p className="text-sm text-gray-500">Offline</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Organizations List */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">All Organizations</h2>
            <p className="text-sm text-gray-500 mt-1">Click on an organization to see member details</p>
          </div>

          {!data ? (
            <div className="p-12 text-center">
              <RefreshCw className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Loading organizations...</p>
            </div>
          ) : data.organizations.length === 0 ? (
            <div className="p-12 text-center">
              <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No organizations registered yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {data.organizations.map((org) => (
                <div key={org.id} className="hover:bg-gray-50 transition-colors">
                  {/* Organization Row */}
                  <div
                    className="p-6 cursor-pointer"
                    onClick={() => toggleOrgExpand(org.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <Building2 className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{org.name}</h3>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {org.totalMembers} members
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              Joined {format(new Date(org.createdAt), 'MMM d, yyyy')}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {/* Online Status */}
                        <div className="flex items-center gap-2">
                          {org.onlineCount > 0 ? (
                            <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                              {org.onlineCount} online
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-gray-400 text-sm">
                              <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
                              All offline
                            </span>
                          )}
                        </div>

                        {/* Last Activity */}
                        {org.lastActivity && (
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatDistanceToNow(new Date(org.lastActivity), { addSuffix: true })}
                          </div>
                        )}

                        {/* Delete Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(org.id, org.name);
                          }}
                          className="p-2 hover:bg-red-100 rounded-lg text-red-600 transition-colors"
                          title="Delete organization"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>

                        {/* Expand Icon */}
                        {expandedOrgs.has(org.id) ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Members */}
                  {expandedOrgs.has(org.id) && (
                    <div className="px-6 pb-6">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Team Members</h4>
                        <div className="space-y-2">
                          {org.members.map((member) => (
                            <div
                              key={member.id}
                              className="flex items-center justify-between py-2 px-3 bg-white rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                                    member.role === 'owner'
                                      ? 'bg-purple-500'
                                      : member.role === 'manager'
                                      ? 'bg-yellow-500'
                                      : 'bg-blue-500'
                                  }`}
                                >
                                  {member.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900 text-sm">{member.name}</p>
                                  <p className="text-xs text-gray-500 capitalize">{member.role}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                {member.lastActivity && (
                                  <span className="text-xs text-gray-400">
                                    {formatDistanceToNow(new Date(member.lastActivity), { addSuffix: true })}
                                  </span>
                                )}
                                {member.isOnline ? (
                                  <span className="flex items-center gap-1 text-green-600 text-xs">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                    Online
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1 text-gray-400 text-xs">
                                    <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
                                    Offline
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Note */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-yellow-800 font-medium">Online Status Note</p>
            <p className="text-sm text-yellow-700 mt-1">
              Users are considered "online" if they were active in the last 5 minutes. 
              Activity is tracked when users log in or navigate through the dashboard.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
