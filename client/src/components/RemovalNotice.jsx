import { REMOVAL_TIPS } from '../constants.js'
import { describeRemoval, formatDateTime } from '../utils/format.js'
import Alert from './Alert.jsx'

// The box at the top of a removed complaint. The resident learns why; the admin sees what the resident was told.
export default function RemovalNotice({ entry, isAdmin }) {
  const { label, message } = describeRemoval(entry)
  const when = formatDateTime(entry.createdAt)

  if (isAdmin) {
    return (
      <Alert tone="info">
        <strong>Removed by {entry.by?.name ?? 'an admin'}</strong> on {when}. Reason: {label}.
        {message && <> Message to the resident: {message}</>} The resident can still read it, the agent cannot.
      </Alert>
    )
  }

  const tip = REMOVAL_TIPS[entry.reason]
  return (
    <Alert tone="error">
      <div className="removal">
        <p>
          <strong>The office removed this complaint</strong> on {when}.
        </p>
        <p>Reason: {label}</p>
        {message && <p className="removal__message">{message}</p>}
        {tip && <p>{tip}</p>}
      </div>
    </Alert>
  )
}
