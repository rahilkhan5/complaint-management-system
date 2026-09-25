import { CircleAlert, CircleCheck, Info } from 'lucide-react'

const ICONS = { error: CircleAlert, success: CircleCheck, info: Info }

// Inline message. Errors are announced right away; the others politely.
export default function Alert({ tone = 'info', children, action }) {
  const Icon = ICONS[tone]
  return (
    <div className={`alert alert--${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
      <Icon size={18} strokeWidth={2} aria-hidden="true" className="alert__icon" />
      <div className="alert__body">{children}</div>
      {action}
    </div>
  )
}
