import { Minus, TrendingDown, TrendingUp } from 'lucide-react'
import { Link } from 'react-router'
import { STATUSES, STATUS_LABELS } from '../constants.js'

// Compares this week with last week in plain words
function Trend({ label, now, before }) {
  const diff = now - before
  let Icon = Minus
  let text = 'same as last week'
  if (diff > 0) {
    Icon = TrendingUp
    text = `${diff} more than last week`
  } else if (diff < 0) {
    Icon = TrendingDown
    text = `${Math.abs(diff)} fewer than last week`
  }

  return (
    <div className="trend">
      <dt>{label}</dt>
      <dd>
        <span className="trend__value">{now}</span>
        <span className="trend__change">
          <Icon size={14} aria-hidden="true" />
          {text}
        </span>
      </dd>
    </div>
  )
}

function IndexLink({ to, current, status, label, count }) {
  return (
    <li>
      <Link to={to} className="index__link" aria-current={current ? 'true' : undefined} data-status={status}>
        <span className="index__dot" aria-hidden="true" />
        {label}
        <span className="index__count">{count ?? ''}</span>
      </Link>
    </li>
  )
}

// The drawer index: one entry per status with its count. A chip row on phones, a side list on desktop.
export default function StatusIndex({ stats, isAdmin, activeStatus, unassignedActive, linkFor }) {
  const noFilter = !activeStatus && !unassignedActive
  const maxCategory = Math.max(1, ...(stats?.byCategory ?? []).map((row) => row.count))

  return (
    <div className="index">
      <nav aria-label="Filter by status">
        <ul className="index__list">
          <IndexLink to={linkFor({ status: null, unassigned: null })} current={noFilter} label="All" count={stats?.total} />
          {STATUSES.map((status) => (
            <IndexLink
              key={status}
              to={linkFor({ status, unassigned: null })}
              current={activeStatus === status}
              status={status}
              label={STATUS_LABELS[status]}
              count={stats?.byStatus[status]}
            />
          ))}
          {isAdmin && (
            <IndexLink
              to={linkFor({ status: null, unassigned: 'true' })}
              current={unassignedActive}
              label="Needs an agent"
              count={stats?.unassigned}
            />
          )}
        </ul>
      </nav>

      {stats && (
        <div className="index__extra">
          <section className="side-block" aria-labelledby="week-title">
            <h2 id="week-title" className="side-block__title">
              This week
            </h2>
            <dl className="trend-list">
              <Trend label="New complaints" now={stats.newThisWeek} before={stats.newLastWeek} />
              <Trend label="Resolved" now={stats.resolvedThisWeek} before={stats.resolvedLastWeek} />
            </dl>
          </section>

          {isAdmin && stats.byCategory?.length > 0 && (
            <section className="side-block" aria-labelledby="category-title">
              <h2 id="category-title" className="side-block__title">
                Unfinished work by category
              </h2>
              <ul className="bars">
                {stats.byCategory.map((row) => (
                  <li key={row.category}>
                    <div className="bar__label">
                      <span>{row.category}</span>
                      <span className="mono">{row.count}</span>
                    </div>
                    <div className="bar__track" aria-hidden="true">
                      <span className="bar__fill" style={{ width: `${(row.count / maxCategory) * 100}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
