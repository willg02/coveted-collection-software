import { useState } from 'react';
import {
  MessageSquare,
  CalendarDays,
  Clock,
  MonitorPlay,
  Bell as BellIcon,
  CheckSquare,
  TrendingUp,
  User,
  Users,
  GitBranch,
  BookOpen,
  Bell,
  BarChart3,
  ClipboardList,
  Settings,
  Sparkles,
  Plus,
  Info,
} from 'lucide-react';

/* ── Sub-page views ── */

function AnnouncementsView() {
  return (
    <div>
      <button className="hr-portal__new-btn">
        <Plus size={18} />
        New Announcement
      </button>
      <div className="hr-portal__empty">
        <div className="hr-portal__empty-icon">
          <Info size={28} />
        </div>
        <p>No announcements yet</p>
      </div>
    </div>
  );
}

function MessagesView() {
  return (
    <div className="hr-portal__empty">
      <div className="hr-portal__empty-icon"><MessageSquare size={28} /></div>
      <p>No messages yet</p>
    </div>
  );
}

function LeaveRequestsView() {
  return (
    <div className="hr-portal__empty">
      <div className="hr-portal__empty-icon"><CalendarDays size={28} /></div>
      <p>No leave requests</p>
    </div>
  );
}

function TimeTrackingView() {
  return (
    <div className="hr-portal__empty">
      <div className="hr-portal__empty-icon"><Clock size={28} /></div>
      <p>No time entries yet</p>
    </div>
  );
}

function MeetingHubView() {
  return (
    <div className="hr-portal__empty">
      <div className="hr-portal__empty-icon"><MonitorPlay size={28} /></div>
      <p>No meetings scheduled</p>
    </div>
  );
}

function TasksView() {
  return (
    <div className="hr-portal__empty">
      <div className="hr-portal__empty-icon"><CheckSquare size={28} /></div>
      <p>No tasks assigned</p>
    </div>
  );
}

function PerformanceView() {
  return (
    <div className="hr-portal__empty">
      <div className="hr-portal__empty-icon"><TrendingUp size={28} /></div>
      <p>No performance reviews</p>
    </div>
  );
}

function MyProfileView() {
  return (
    <div className="hr-portal__empty">
      <div className="hr-portal__empty-icon"><User size={28} /></div>
      <p>Profile settings coming soon</p>
    </div>
  );
}

function DirectoryView() {
  return (
    <div className="hr-portal__empty">
      <div className="hr-portal__empty-icon"><Users size={28} /></div>
      <p>Employee directory is empty</p>
    </div>
  );
}

function OrgChartView() {
  return (
    <div className="hr-portal__empty">
      <div className="hr-portal__empty-icon"><GitBranch size={28} /></div>
      <p>Org chart not configured</p>
    </div>
  );
}

function SOPsView() {
  return (
    <div className="hr-portal__empty">
      <div className="hr-portal__empty-icon"><BookOpen size={28} /></div>
      <p>No SOPs added yet</p>
    </div>
  );
}

function NotificationsView() {
  return (
    <div className="hr-portal__empty">
      <div className="hr-portal__empty-icon"><Bell size={28} /></div>
      <p>No notifications</p>
    </div>
  );
}

function ReportsView() {
  return (
    <div className="hr-portal__empty">
      <div className="hr-portal__empty-icon"><BarChart3 size={28} /></div>
      <p>No reports available</p>
    </div>
  );
}

function OnboardingView() {
  return (
    <div className="hr-portal__empty">
      <div className="hr-portal__empty-icon"><ClipboardList size={28} /></div>
      <p>No onboarding tasks</p>
    </div>
  );
}

function LeaveManagementView() {
  return (
    <div className="hr-portal__empty">
      <div className="hr-portal__empty-icon"><Settings size={28} /></div>
      <p>Leave management not configured</p>
    </div>
  );
}

function AIIntelligenceView() {
  return (
    <div className="hr-portal__empty">
      <div className="hr-portal__empty-icon"><Sparkles size={28} /></div>
      <p>AI Intelligence Systems coming soon</p>
    </div>
  );
}

/* ── View registry ── */

const views = {
  messages:         { label: 'Messages',            icon: MessageSquare,  component: MessagesView },
  leave:            { label: 'Leave Requests',      icon: CalendarDays,   component: LeaveRequestsView },
  time:             { label: 'Time Tracking',       icon: Clock,          component: TimeTrackingView },
  meetings:         { label: 'Meeting Hub',         icon: MonitorPlay,    component: MeetingHubView },
  announcements:    { label: 'Announcements',       icon: BellIcon,       component: AnnouncementsView },
  tasks:            { label: 'Tasks',               icon: CheckSquare,    component: TasksView },
  performance:      { label: 'Performance',         icon: TrendingUp,     component: PerformanceView },
  profile:          { label: 'My Profile',          icon: User,           component: MyProfileView },
  directory:        { label: 'Directory',           icon: Users,          component: DirectoryView },
  orgchart:         { label: 'Org Chart',           icon: GitBranch,      component: OrgChartView },
  sops:             { label: 'SOPs',                icon: BookOpen,       component: SOPsView },
  notifications:    { label: 'Notifications',       icon: Bell,           component: NotificationsView },
  reports:          { label: 'Reports & Analytics', icon: BarChart3,      component: ReportsView },
  onboarding:       { label: 'Onboarding',          icon: ClipboardList,  component: OnboardingView },
  leavemanagement:  { label: 'Leave Management',    icon: Settings,       component: LeaveManagementView },
  ai:               { label: 'AI Intelligence Systems', icon: Sparkles,   component: AIIntelligenceView },
};

const mainLinks = ['messages', 'leave', 'time', 'meetings', 'announcements', 'tasks', 'performance', 'profile', 'directory', 'orgchart', 'sops', 'notifications'];
const adminLinks = ['reports', 'onboarding', 'leavemanagement', 'ai'];

/* ── Main HR Hub Page ── */

export default function HR() {
  const [activeView, setActiveView] = useState('announcements');
  const ActiveComponent = views[activeView].component;

  return (
    <div className="hr-portal">
      {/* ── Sidebar ── */}
      <aside className="hr-portal__sidebar">
        <div className="hr-portal__sidebar-header">
          <h2 className="hr-portal__sidebar-title">HR Portal</h2>
          <span className="hr-portal__sidebar-subtitle">Employee Management</span>
        </div>

        {/* Stat cards */}
        <div className="hr-portal__stats">
          <div className="hr-portal__stat hr-portal__stat--blue">
            <MessageSquare size={16} />
            <div>
              <span className="hr-portal__stat-label">Messages</span>
              <span className="hr-portal__stat-value">0</span>
            </div>
          </div>
          <div className="hr-portal__stat hr-portal__stat--amber">
            <CalendarDays size={16} />
            <div>
              <span className="hr-portal__stat-label">Pending Leave</span>
              <span className="hr-portal__stat-value">0</span>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav className="hr-portal__nav">
          {mainLinks.map((key) => {
            const v = views[key];
            const Icon = v.icon;
            return (
              <button
                key={key}
                className={`hr-portal__nav-link${activeView === key ? ' hr-portal__nav-link--active' : ''}`}
                onClick={() => setActiveView(key)}
              >
                <Icon size={18} />
                {v.label}
              </button>
            );
          })}

          <div className="hr-portal__nav-divider" />
          <span className="hr-portal__nav-section">HR ADMIN</span>

          {adminLinks.map((key) => {
            const v = views[key];
            const Icon = v.icon;
            return (
              <button
                key={key}
                className={`hr-portal__nav-link${activeView === key ? ' hr-portal__nav-link--active' : ''}`}
                onClick={() => setActiveView(key)}
              >
                <Icon size={18} />
                {v.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* ── Main content ── */}
      <section className="hr-portal__content">
        <ActiveComponent />
      </section>
    </div>
  );
}
