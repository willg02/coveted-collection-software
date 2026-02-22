import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import SidebarNav from '../components/SidebarNav';

export default function AppLayout() {
  return (
    <div className="app-layout">
      <SidebarNav />
      <div className="main-content">
        <Header />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
