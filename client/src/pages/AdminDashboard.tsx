import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getAdminStats, getAdminUsers } from '../services/api';
import { 
  UsersIcon, 
  HomeIcon, 
  BuildingOfficeIcon, 
  ChartBarIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

interface Stats {
  totalUsers: number;
  totalProperties: number;
  totalCompanies: number;
  recentActivity: any[];
}

interface User {
  _id: string;
  firstName: string;
  lastName?: string;
  email: string;
  role: string;
  createdAt: string;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalProperties: 0,
    totalCompanies: 0,
    recentActivity: []
  });
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsData, usersData] = await Promise.all([
        getAdminStats(),
        getAdminUsers()
      ]);
      setStats(statsData);
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Mock data for demo
      setStats({
        totalUsers: 1250,
        totalProperties: 3420,
        totalCompanies: 45,
        recentActivity: [
          { id: 1, action: 'ახალი მომხმარებელი დარეგისტრირდა', time: '2 საათის წინ' },
          { id: 2, action: 'დაამატეს ახალი განცხადება', time: '4 საათის წინ' },
          { id: 3, action: 'კომპანია დარეგისტრირდა', time: '6 საათის წინ' }
        ]
      });
      setUsers([
        {
          _id: '1',
          firstName: 'გიორგი',
          lastName: 'მაისურაძე',
          email: 'giorgi@example.com',
          role: 'company',
          createdAt: '2024-01-15'
        },
        {
          _id: '2',
          firstName: 'მარია',
          lastName: 'ბერიძე',
          email: 'maria@example.com',
          role: 'company',
          createdAt: '2024-01-14'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ka-GE');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ადმინის პანელი
          </h1>
          <p className="text-lg text-gray-600">
            გამარჯობა, {user?.firstName || 'ადმინი'}! აი თქვენი სისტემის სტატისტიკა
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-white/20 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <UsersIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">მომხმარებლები</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-white/20 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl shadow-lg">
                <HomeIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">განცხადებები</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProperties}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-white/20 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg">
                <BuildingOfficeIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">კომპანიები</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCompanies}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-white/20 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl shadow-lg">
                <ChartBarIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">აქტივობა</p>
                <p className="text-2xl font-bold text-gray-900">{stats.recentActivity.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-white/20">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              ბოლო აქტივობები
            </h2>
            <div className="space-y-3">
              {stats.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-white/20">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              ბოლო მომხმარებლები
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      მომხმარებელი
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      როლი
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      თარიღი
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      მოქმედებები
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white/50 divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50/50 transition-colors duration-200">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {`${user.firstName} ${user.lastName || ''}`.trim()}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'superadmin' ? 'bg-red-100 text-red-800' :
                          user.role === 'company' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {user.role === 'superadmin' ? 'სუპერ ადმინი' :
                           user.role === 'company' ? 'კომპანია' : 'მომხმარებელი'}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-900 p-1 rounded-lg hover:bg-blue-50 transition-colors duration-200">
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button className="text-green-600 hover:text-green-900 p-1 rounded-lg hover:bg-green-50 transition-colors duration-200">
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-900 p-1 rounded-lg hover:bg-red-50 transition-colors duration-200">
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 