import { useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  CheckSquare,
  Mail,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Building2,
  Clock,
  ListTodo,
  MessageSquare,
  Users,
  Zap,
  Plus,
  FileText,
  Settings,
} from 'lucide-react';
import DashboardCard from '../components/DashboardCard';
import { dashboardStats } from '../data/mockData';

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <>
      {/* ---- Top stat row ---- */}
      <div className="dashboard-grid">
        <StatCard title="Active Orders" value={dashboardStats.activeOrders} />
        <StatCard title="My Tasks" value={dashboardStats.myTasks} />
        <StatCard title="Messages" value={dashboardStats.messages} />
        <StatCard title="Overdue" value={dashboardStats.overdue} />
      </div>

      {/* ---- Quick Access ---- */}
      <div className="quick-access">
        <div className="quick-access__title">Quick Access</div>
        <div className="quick-access__grid">
          <QuickBtn icon={<Plus size={16} />} label="New Order" />
          <QuickBtn icon={<Building2 size={16} />} label="Properties" />
          <QuickBtn icon={<FileText size={16} />} label="Reports" />
          <QuickBtn icon={<Users size={16} />} label="Team" />
          <QuickBtn icon={<Settings size={16} />} label="Settings" />
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
            { label: 'Active Orders', value: dashboardStats.activeOrders },
            { label: 'Properties', value: 2 },
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
            { label: 'My Hours Today', value: '0h' },
            { label: 'This Week', value: '0h' },
          ]}
          ctaLabel="Open Time Tracking"
          onCtaClick={() => navigate('/operations')}
        />

        <DashboardCard
          icon={<ListTodo size={22} />}
          iconColor="violet"
          title="Tasks"
          subtitle="Manage and track team tasks with AI insights"
          metrics={[
            { label: 'My Active Tasks', value: 0 },
            { label: 'Overdue', value: 0 },
          ]}
          ctaLabel="Open Tasks"
          onCtaClick={() => navigate('/operations')}
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
            { label: 'Unread Messages', value: 0 },
            { label: 'Pending Leave', value: 0 },
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

function QuickBtn({ icon, label }) {
  return (
    <button className="quick-access__btn">
      {icon}
      {label}
    </button>
  );
}
