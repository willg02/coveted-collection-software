import { Bell, Search } from 'lucide-react';

export default function Header({ userName = 'Will Gibson' }) {
  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('');

  return (
    <header className="header">
      <h2 className="header__greeting">Welcome back, {userName}</h2>
      <div className="header__actions">
        <button className="header__icon-btn" aria-label="Search">
          <Search size={20} />
        </button>
        <button className="header__icon-btn" aria-label="Notifications">
          <Bell size={20} />
        </button>
        <div className="header__avatar" title={userName}>
          {initials}
        </div>
      </div>
    </header>
  );
}
