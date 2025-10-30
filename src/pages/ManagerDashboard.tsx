import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Users, TrendingUp, Calendar, DollarSign, Plus, Search } from 'lucide-react';
import Layout from '../components/Layout';
import StudentManagement from '../components/manager/StudentManagement';
import StatisticsPanel from '../components/manager/StatisticsPanel';

export default function ManagerDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'students'>('overview');

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-800">Tableau de bord</h2>
        </div>

        <div className="flex gap-2 bg-white/80 backdrop-blur-sm p-1 rounded-xl shadow-sm border border-rose-100 w-fit">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
              activeTab === 'overview'
                ? 'bg-gradient-to-r from-rose-400 to-pink-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-rose-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span>Vue d'ensemble</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
              activeTab === 'students'
                ? 'bg-gradient-to-r from-rose-400 to-pink-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-rose-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>Gestion des élèves</span>
            </div>
          </button>
        </div>

        {activeTab === 'overview' && <StatisticsPanel />}
        {activeTab === 'students' && <StudentManagement />}
      </div>
    </Layout>
  );
}
