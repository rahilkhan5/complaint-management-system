// Form fields with a real <label>, an optional hint and an error message
// that screen readers read out together with the input.

function describedBy(id, hint, error) {
  const ids = []
  if (hint) ids.push(`${id}-hint`)
  if (error) ids.push(`${id}-error`)
  return ids.length ? ids.join(' ') : undefined
}

function FieldShell({ id, label, hint, error, optional, children }) {
  return (
    <div className={`field${error ? ' field--error' : ''}`}>
      <label className="field__label" htmlFor={id}>
        {label}
        {optional && <span className="field__optional"> (optional)</span>}
      </label>
      {hint && (
        <p className="field__hint" id={`${id}-hint`}>
          {hint}
        </p>
      )}
      {children}
      {error && (
        <p className="field__error" id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  )
}

export function TextField({ id, label, hint, error, optional, multiline = false, ...inputProps }) {
  const Input = multiline ? 'textarea' : 'input'
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} optional={optional}>
      <Input
        id={id}
        className="input"
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy(id, hint, error)}
        {...inputProps}
      />
    </FieldShell>
  )
}

export function SelectField({ id, label, hint, error, optional, options, placeholder, ...selectProps }) {
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} optional={optional}>
      <select
        id={id}
        className="input input--select"
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy(id, hint, error)}
        {...selectProps}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  )
}
