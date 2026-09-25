// Grey placeholder shapes shown while data loads, so the layout does not jump
export function FileListSkeleton({ rows = 4 }) {
  return (
    <ul className="file-list" aria-hidden="true">
      {Array.from({ length: rows }, (_, i) => (
        <li key={i} className="file">
          <span className="file__tab file__tab--skeleton">
            <span className="skeleton" style={{ width: 64, height: 12 }} />
          </span>
          <div className="file__body">
            <div className="file__main">
              <span className="skeleton" style={{ width: '70%', height: 16 }} />
              <span className="skeleton" style={{ width: '45%', height: 12, marginTop: 10 }} />
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}

export function Skeleton({ width = '100%', height = 14 }) {
  return <span className="skeleton" style={{ width, height }} aria-hidden="true" />
}
