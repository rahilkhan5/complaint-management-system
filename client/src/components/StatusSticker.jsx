import { STATUS_LABELS } from '../constants.js'

// "removed" is not a status, but a removed complaint shows this sticker instead of its status
const LABELS = { ...STATUS_LABELS, removed: 'Removed' }

// A round colored sticker plus the status in words, so color is never the only signal
export default function StatusSticker({ status, size = 'md', stamped = false }) {
  const classes = ['sticker']
  if (size === 'lg') classes.push('sticker--lg')
  if (stamped) classes.push('is-stamped')

  return (
    <span className={classes.join(' ')} data-status={status}>
      <span className="sticker__dot" aria-hidden="true" />
      {LABELS[status] || status}
    </span>
  )
}
