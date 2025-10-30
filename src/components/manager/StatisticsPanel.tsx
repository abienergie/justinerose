import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { DollarSign, Users, Calendar, TrendingUp } from 'lucide-react';

interface Statistics {
  totalRevenue: number;
  totalStudents: number;
  totalSessions: number;
  averageAttendance: number;
}

export default function StatisticsPanel() {
  const [stats, setStats] = useState<Statistics>({
    totalRevenue: 0,
    totalStudents: 0,
    totalSessions: 0,
    averageAttendance: 0,
  });
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'month' | 'year'>('month');

  useEffect(() => {
    fetchStatistics();
  }, [period]);

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      const now = new Date();
      let startDate = new Date();

      if (period === 'month') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      } else {
        startDate = new Date(now.getFullYear(), 0, 1);
      }

      const { data: students } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'student');

      const { data: sessions } = await supabase
        .from('sessions')
        .select('*')
        .gte('session_date', startDate.toISOString().split('T')[0]);

      const { data: packages } = await supabase
        .from('course_packages')
        .select('*')
        .gte('purchase_date', startDate.toISOString());

      const revenue = packages?.reduce((sum, pkg) => {
        const prices = { single: 98, card_5: 450, card_10: 800 };
        return sum + (prices[pkg.package_type as keyof typeof prices] || pkg.custom_price || 0);
      }, 0) || 0;

      setStats({
        totalRevenue: revenue,
        totalStudents: students?.length || 0,
        totalSessions: sessions?.length || 0,
        averageAttendance: students?.length ? (sessions?.length || 0) / students.length : 0,
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Revenus',
      value: `${stats.totalRevenue}€`,
      icon: DollarSign,
      color: 'from-green-400 to-emerald-500',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Élèves actifs',
      value: stats.totalStudents,
      icon: Users,
      color: 'from-blue-400 to-cyan-500',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Cours effectués',
      value: stats.totalSessions,
      icon: Calendar,
      color: 'from-rose-400 to-pink-500',
      bgColor: 'bg-rose-50',
    },
    {
      title: 'Fréquentation moy.',
      value: stats.averageAttendance.toFixed(1),
      icon: TrendingUp,
      color: 'from-amber-400 to-orange-500',
      bgColor: 'bg-amber-50',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-800">Statistiques</h3>
        <div className="flex gap-2 bg-white/80 backdrop-blur-sm p-1 rounded-xl shadow-sm border border-rose-100">
          <button
            onClick={() => setPeriod('month')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              period === 'month'
                ? 'bg-gradient-to-r from-rose-400 to-pink-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-rose-50'
            }`}
          >
            Ce mois
          </button>
          <button
            onClick={() => setPeriod('year')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              period === 'year'
                ? 'bg-gradient-to-r from-rose-400 to-pink-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-rose-50'
            }`}
          >
            Cette année
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div
            key={stat.title}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-rose-100 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                <stat.icon className="w-6 h-6 text-gray-700" />
              </div>
            </div>
            <h4 className="text-gray-600 text-sm font-medium mb-1">{stat.title}</h4>
            <p className="text-3xl font-bold text-gray-800">
              {loading ? '...' : stat.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
