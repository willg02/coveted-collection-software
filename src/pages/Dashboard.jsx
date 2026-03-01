import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  BarChart3,
  Building2,
  Clock,
  ListTodo,
  MessageSquare,
  Users,
  Plus,
  FileText,
  Settings,
} from 'lucide-react';
import DashboardCard from '../components/DashboardCard';
import api from '../lib/apiClient';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.getDashboardStats().then(setStats).catch(() => {});
  }, []);

  const s = stats ?? {};

  return (
    <>
      {/* ---- Top stat row ---- */}
      <div className="dashboard-grid">
        <StatCard title="Active Orders" value={stats == null ? '…' : s.activeOrders} />
        <StatCard title="My Tasks"     value={stats == null ? '…' : s.myTasks} />
        <StatCard title="Messages"     value={stats == null ? '…' : s.messages} />
        <StatCard title="Overdue"      value={stats == null ? '…' : s.overdue} />
      </div>

      {/* ---- Quick Access ---- */}
      <div className="quick-access">
        <div className="quick-access__title">Quick Access</div>
        <div className="quick-access__grid">
          <QuickBtn icon={<Plus size={16} />}     label="New Order"   onClick={() => navigate('/properties')} />
          <QuickBtn icon={<Building2 size={16} />} label="Properties" onClick={() => navigate('/properties')} />
          <QuickBtn icon={<FileText size={16} />}  label="Reports"    onClick={() => navigate('/hr')} />
          <QuickBtn icon={<Users size={16} />}     label="Team"       onClick={() => navigate('/hr')} />
          <QuickBtn icon={<Settings size={16} />}  label="Settings"   onClick={() => navigate('/hr')} />
        </div>
      </div>

      {/* ---- Feature cards grid ---- */}
      <div className="dashboard-cards">
        <DashboardCard
          icon={<TrendingUp size={22} />}
          iconColor="indigo"
          title="Sales Analytics"
          subtitle="AI-powered revenue forecasting for new properties"
          ctaLabel="Open Sales Analytics"
          onCtaClick={() => navigate('/sales')}
        />

        <DashboardCard
          icon={<BarChart3 size={22} />}
          iconColor="blue"
          title="Market Analysis"
          subtitle="AI-Powered Live Data"
          ctaLabel="Open Sales Analytics"
          onCtaClick={() => navigate('/sales')}
        />

        <DashboardCard
          icon={<Building2 size={22} />}
          iconColor="emerald"
          title="New Unit Development"
          subtitle="Manage property orders, setup tasks, and SOPs"
          metrics={[
            { label: 'Active Orders', value: stats == null ? '…' : s.activeOrders },
            { label: 'Properties',    value: stats == null ? '…' : s.properties },
          ]}
          ctaLabel="Open New Unit Development"
          onCtaClick={() => navigate('/properties')}
        />

        <DashboardCard
          icon={<Clock size={22} />}
          iconColor="amber"
          title="Time Tracking"
          subtitle="Track hours, manage schedules and timesheets"
          metrics={[
            { label: 'My Hours Today', value: stats == null ? '…' : `${s.hoursToday}h` },
            { label: 'This Week',      value: stats == null ? '…' : `${s.hoursThisWeek}h` },
          ]}
          ctaLabel="Open Time Tracking"
          onCtaClick={() => navigate('/hr')}
        />

        <DashboardCard
          icon={<ListTodo size={22} />}
          iconColor="violet"
          title="Tasks"
          subtitle="Manage and track team tasks with AI insights"
          metrics={[
            { label: 'My Active Tasks', value: stats == null ? '…' : s.myTasks },
            { label: 'Overdue',         value: stats == null ? '…' : s.overdue },
          ]}
          ctaLabel="Open Tasks"
          onCtaClick={() => navigate('/hr')}
        />

        <DashboardCard
          icon={<MessageSquare size={22} />}
          iconColor="cyan"
          title="Coveted Chat"
          subtitle="AI assistants for operations and HR support"
          metrics={[{ label: 'Bots Ready to help', value: 2 }]}
          ctaLabel="Open Coveted Chat"
          onCtaClick={() => navigate('/chat')}
        />

        <DashboardCard
          icon={<Users size={22} />}
          iconColor="rose"
          title="HR & Communications"
          subtitle="Employee management, performance, and communications"
          metrics={[
            { label: 'Unread Messages', value: stats == null ? '…' : s.messages },
            { label: 'Pending Leave',   value: stats == null ? '…' : s.pendingLeave },
          ]}
          ctaLabel="Open HR & Communications"
          onCtaClick={() => navigate('/hr')}
        />
      </div>
    </>
  );
}

/* ---- Small helper components ---- */

function StatCard({ title, value }) {
  return (
    <div className="stat-card">
      <div className="stat-card__title">{title}</div>
      <div className="stat-card__value">{value}</div>
    </div>
  );
}

function QuickBtn({ icon, label, onClick }) {
  return (
    <button className="quick-access__btn" onClick={onClick}>
      {icon}
      {label}
    </button>
  );
}
