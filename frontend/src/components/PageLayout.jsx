import Sidebar from './Sidebar';
import '../styles/dashboard.css';

export default function PageLayout({ title, subtitle, actions, children }) {
  return (
    <div className="dash-layout">
      <Sidebar />
      <main className="dash-main">
        <div className="dash-header">
          <div>
            <h1>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
          </div>
          {actions && <div className="header-pills">{actions}</div>}
        </div>
        {children}
      </main>
    </div>
  );
}