import { useEffect, useState } from 'react'
import { apiRequest } from './api/client.js'

const STATUS_LABELS = {
  loading: 'Checking server...',
  online: 'Server online',
  offline: 'Server offline',
}

function App() {
  const [status, setStatus] = useState('loading')
  const [health, setHealth] = useState(null)

  useEffect(() => {
    apiRequest('/health')
      .then((data) => {
        setHealth(data)
        setStatus('online')
      })
      .catch(() => setStatus('offline'))
  }, [])

  return (
    <main className="page">
      <section className="card">
        <p className="eyebrow">MERN Stack Project</p>
        <h1>Complaint Management System</h1>
        <p className="lead">
          Residents raise complaints, support agents resolve them, and admins
          track everything in one place.
        </p>

        <div className={`status status--${status}`} role="status">
          <span className="status__dot" aria-hidden="true" />
          {STATUS_LABELS[status]}
        </div>

        {health && (
          <dl className="meta">
            <div>
              <dt>API</dt>
              <dd>{health.status}</dd>
            </div>
            <div>
              <dt>Database</dt>
              <dd>{health.database}</dd>
            </div>
          </dl>
        )}

        {status === 'offline' && (
          <p className="hint">
            Start the server with <code>npm run dev</code> from the project root.
          </p>
        )}
      </section>
    </main>
  )
}

export default App
