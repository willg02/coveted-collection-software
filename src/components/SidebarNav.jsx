import { NavLink } from 'react-router-dom';
import {
  Home,
  Building2,
  DollarSign,
  TrendingUp,
  Settings,
  Users,
  MessageSquare,
} from 'lucide-react';

const links = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/properties', label: 'Properties', icon: Building2 },
  { to: '/financials', label: 'Financials', icon: DollarSign },
  { to: '/sales', label: 'Sales', icon: TrendingUp },
  { to: '/operations', label: 'Operations', icon: Settings },
  { to: '/hr', label: 'HR Hub', icon: Users },
  { to: '/chat', label: 'Coveted Chat', icon: MessageSquare },
];

export default function SidebarNav() {
  return (
    <aside className="sidebar">
      <div className="sidebar__logo">Coveted Collection</div>
      <nav className="sidebar__nav">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `sidebar__link${isActive ? ' sidebar__link--active' : ''}`
            }
          >
            <Icon />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
