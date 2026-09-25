import { FolderOpen, LogOut, Plus, Users } from 'lucide-react'
import { Link, NavLink, Outlet, useLocation } from 'react-router'
import { ROLE_LABELS } from '../constants.js'
import { useAuth } from '../context/useAuth.js'
import Logo from './Logo.jsx'

function initials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
}

export default function AppShell() {
  const { user, logout } = useAuth()
  const { pathname } = useLocation()

  // Residents on phones get a fixed "File a complaint" button on their list
  const showActionBar = user.role === 'resident' && pathname === '/complaints'
  // The list and every complaint page count as "Complaints" in the menu
  const onList = pathname.startsWith('/complaints') && pathname !== '/complaints/new'

  return (
    <div className={showActionBar ? 'has-action-bar' : undefined}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <header className="header">
        <div className="container header__inner">
          <Link to="/complaints" className="header__brand" aria-label="Complaint Desk home">
            <Logo />
          </Link>

          <nav className="nav" aria-label="Main">
            <Link to="/complaints" className="nav__link" aria-current={onList ? 'page' : undefined}>
              <FolderOpen size={16} aria-hidden="true" />
              Complaints
            </Link>
            {user.role === 'admin' && (
              <NavLink to="/staff" className="nav__link">
                <Users size={16} aria-hidden="true" />
                Staff
              </NavLink>
            )}
            {user.role === 'resident' && (
              <NavLink to="/complaints/new" className="nav__link desk-only">
                <Plus size={16} aria-hidden="true" />
                New complaint
              </NavLink>
            )}
          </nav>

          <div className="header__user">
            <NavLink to="/account" className="header__account" aria-label={`My account, ${user.name}`}>
              <span className="header__who">
                <span className="header__name">{user.name}</span>
                <span className="header__role">{ROLE_LABELS[user.role]}</span>
              </span>
              <span className="avatar" aria-hidden="true">
                {initials(user.name)}
              </span>
            </NavLink>
            <button type="button" className="btn btn--ghost btn--sm" onClick={logout} aria-label="Log out">
              <LogOut size={16} aria-hidden="true" />
              <span className="header__logout-text">Log out</span>
            </button>
          </div>
        </div>
      </header>

      <main id="main" className="main">
        <div className="container">
          <Outlet />
        </div>
      </main>

      {showActionBar && (
        <div className="action-bar">
          <Link to="/complaints/new" className="btn btn--primary btn--block">
            <Plus size={18} aria-hidden="true" />
            File a complaint
          </Link>
        </div>
      )}
    </div>
  )
}
