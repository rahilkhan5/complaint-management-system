import { ChevronLeft, ChevronRight, FolderOpen, Plus, Search, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { complaintsApi } from '../api/services.js'
import Alert from '../components/Alert.jsx'
import EmptyState from '../components/EmptyState.jsx'
import FileList from '../components/FileList.jsx'
import { FileListSkeleton } from '../components/Skeleton.jsx'
import StatusIndex from '../components/StatusIndex.jsx'
import { CATEGORIES, PRIORITY_LABELS } from '../constants.js'
import { useAuth } from '../context/useAuth.js'
import { usePageTitle } from '../hooks/usePageTitle.js'

const HEADINGS = {
  resident: 'My complaints',
  agent: 'Assigned to me',
  admin: 'All complaints',
}

function summaryFor(role, stats) {
  if (!stats) return ''
  const unfinished = stats.byStatus.open + stats.byStatus.in_progress
  if (role === 'resident') {
    if (stats.total === 0) return 'Anything broken in your block? File a complaint and follow it here.'
    const toConfirm = stats.byStatus.resolved
    const confirmText = toConfirm > 0 ? ` ${toConfirm} fixed and waiting for you to confirm.` : ''
    return `You have filed ${stats.total} ${stats.total === 1 ? 'complaint' : 'complaints'}. ${unfinished} still being worked on.${confirmText}`
  }
  if (role === 'agent') {
    return unfinished === 0
      ? 'Nothing is waiting for you right now.'
      : `${unfinished} ${unfinished === 1 ? 'complaint needs' : 'complaints need'} your attention.`
  }
  return `${stats.total} complaints in total. ${stats.unassigned} waiting for an agent.`
}

export default function ComplaintsPage() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  usePageTitle(HEADINGS[user.role])

  const status = searchParams.get('status') || ''
  const category = searchParams.get('category') || ''
  const priority = searchParams.get('priority') || ''
  const q = searchParams.get('q') || ''
  const unassigned = searchParams.get('unassigned') === 'true'
  const page = Number(searchParams.get('page')) || 1

  const [stats, setStats] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [searchText, setSearchText] = useState(q)
  // The last answer from the server, remembered together with the filters it was loaded for
  const [result, setResult] = useState({ key: null, data: null, error: '' })

  const queryKey = `${searchParams.toString()}#${reloadKey}`
  const loading = result.key !== queryKey
  const { data, error } = result

  // Counts for the side index, loaded once
  useEffect(() => {
    complaintsApi
      .stats()
      .then(setStats)
      .catch(() => setStats(null))
  }, [])

  // The list reloads whenever a filter in the URL changes
  useEffect(() => {
    let ignore = false
    complaintsApi
      .list({ status, category, priority, q, page, unassigned: unassigned ? 'true' : '' })
      .then((list) => {
        if (!ignore) setResult({ key: queryKey, data: list, error: '' })
      })
      .catch((err) => {
        if (!ignore) setResult((previous) => ({ key: queryKey, data: previous.data, error: err.message }))
      })
    return () => {
      ignore = true
    }
  }, [queryKey, status, category, priority, q, page, unassigned])

  // Keep the search box in step with the URL (for example after pressing Back)
  const [lastQ, setLastQ] = useState(q)
  if (q !== lastQ) {
    setLastQ(q)
    if (q !== searchText.trim()) setSearchText(q)
  }

  // Wait until the user stops typing for a moment before searching
  useEffect(() => {
    const text = searchText.trim()
    if (text === q) return
    const timer = setTimeout(() => {
      setSearchParams((current) => {
        const next = new URLSearchParams(current)
        if (text) next.set('q', text)
        else next.delete('q')
        next.delete('page')
        return next
      })
    }, 350)
    return () => clearTimeout(timer)
  }, [searchText, q, setSearchParams])

  // Builds a new query string: null removes a value, and any filter change goes back to page 1
  function buildSearch(changes) {
    const next = new URLSearchParams(searchParams)
    for (const [key, value] of Object.entries(changes)) {
      if (value === null || value === '') next.delete(key)
      else next.set(key, value)
    }
    if (!('page' in changes)) next.delete('page')
    const text = next.toString()
    return text ? `?${text}` : ''
  }

  function updateParams(changes) {
    setSearchParams(buildSearch(changes))
  }

  function clearFilters() {
    setSearchText('')
    setSearchParams('')
  }

  const hasFilters = Boolean(status || category || priority || q || unassigned)
  const isResident = user.role === 'resident'

  return (
    <>
      <div className="page-head">
        <div className="page-head__text">
          <h1 className="page-title">{HEADINGS[user.role]}</h1>
          <p className="page-summary">{summaryFor(user.role, stats)}</p>
        </div>
        {isResident && (
          <Link to="/complaints/new" className="btn btn--primary desk-only">
            <Plus size={18} aria-hidden="true" />
            File a complaint
          </Link>
        )}
      </div>

      <div className="desk">
        <aside className="desk__side">
          <StatusIndex
            stats={stats}
            isAdmin={user.role === 'admin'}
            activeStatus={status}
            unassignedActive={unassigned}
            linkFor={(changes) => ({ search: buildSearch(changes) })}
          />
        </aside>

        <section aria-labelledby="results-title">
          <div className="toolbar" role="search">
            <div className="toolbar__search">
              <label htmlFor="search" className="visually-hidden">
                Search complaints
              </label>
              <Search size={18} aria-hidden="true" />
              <input
                id="search"
                type="search"
                className="input"
                placeholder="Search by title, case number or place"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
              />
            </div>
            <label htmlFor="category" className="visually-hidden">
              Category
            </label>
            <select
              id="category"
              className="input input--select"
              value={category}
              onChange={(event) => updateParams({ category: event.target.value })}
            >
              <option value="">All categories</option>
              {CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <label htmlFor="priority" className="visually-hidden">
              Priority
            </label>
            <select
              id="priority"
              className="input input--select"
              value={priority}
              onChange={(event) => updateParams({ priority: event.target.value })}
            >
              <option value="">Any priority</option>
              {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label} priority
                </option>
              ))}
            </select>
          </div>

          <div className="results-line">
            <h2 id="results-title" className="visually-hidden">
              Results
            </h2>
            <span aria-live="polite">
              {data && !loading && `${data.total} ${data.total === 1 ? 'complaint' : 'complaints'} found`}
            </span>
            {hasFilters && (
              <button type="button" className="btn btn--ghost btn--sm" onClick={clearFilters}>
                <X size={16} aria-hidden="true" />
                Clear filters
              </button>
            )}
          </div>

          {error && (
            <Alert
              tone="error"
              action={
                <button type="button" className="btn btn--secondary btn--sm" onClick={() => setReloadKey((n) => n + 1)}>
                  Try again
                </button>
              }
            >
              {error}
            </Alert>
          )}

          {!error && loading && !data && <FileListSkeleton />}

          {!error && data && data.items.length === 0 && (
            <EmptyState
              icon={FolderOpen}
              title={hasFilters ? 'No complaints match these filters' : 'No complaints yet'}
              action={
                hasFilters ? (
                  <button type="button" className="btn btn--secondary" onClick={clearFilters}>
                    Clear filters
                  </button>
                ) : (
                  isResident && (
                    <Link to="/complaints/new" className="btn btn--primary">
                      <Plus size={18} aria-hidden="true" />
                      File your first complaint
                    </Link>
                  )
                )
              }
            >
              {hasFilters
                ? 'Try a different status, category or search word.'
                : user.role === 'agent'
                  ? 'When the office assigns a complaint to you it will show up here.'
                  : isResident
                    ? 'When something needs fixing, file it here and you will get a case number to follow.'
                    : 'Complaints filed by residents will show up here.'}
            </EmptyState>
          )}

          {!error && data && data.items.length > 0 && (
            <div aria-busy={loading} style={{ opacity: loading ? 0.6 : 1, transition: 'opacity 150ms' }}>
              <FileList complaints={data.items} role={user.role} />

              {data.pages > 1 && (
                <nav className="pagination" aria-label="Pages">
                  <Link
                    to={{ search: buildSearch({ page: page - 1 }) }}
                    className="btn btn--secondary btn--sm"
                    aria-disabled={page <= 1}
                    style={page <= 1 ? { pointerEvents: 'none', opacity: 0.5 } : undefined}
                  >
                    <ChevronLeft size={16} aria-hidden="true" />
                    Previous
                  </Link>
                  <span>
                    Page {page} of {data.pages}
                  </span>
                  <Link
                    to={{ search: buildSearch({ page: page + 1 }) }}
                    className="btn btn--secondary btn--sm"
                    aria-disabled={page >= data.pages}
                    style={page >= data.pages ? { pointerEvents: 'none', opacity: 0.5 } : undefined}
                  >
                    Next
                    <ChevronRight size={16} aria-hidden="true" />
                  </Link>
                </nav>
              )}
            </div>
          )}
        </section>
      </div>
    </>
  )
}
