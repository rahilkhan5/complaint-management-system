// The app mark: a file folder with a status sticker on it
export default function Logo({ compact = false }) {
  return (
    <span className="logo">
      <svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true" focusable="false">
        <path
          d="M3 9.5A3.5 3.5 0 0 1 6.5 6h6.4a2 2 0 0 1 1.5.7l2 2.3h9.1A3.5 3.5 0 0 1 29 12.5v11a3.5 3.5 0 0 1-3.5 3.5h-19A3.5 3.5 0 0 1 3 23.5z"
          fill="var(--board)"
        />
        <circle cx="21.5" cy="19" r="4.25" fill="var(--progress)" stroke="var(--surface)" strokeWidth="1.5" />
      </svg>
      {!compact && <span className="logo__text">Complaint Desk</span>}
    </span>
  )
}
