import './ImportSummaryBanner.css';

const ImportSummaryBanner = ({ summary, onDismiss }) => {
  if (!summary) return null;

  const { createdCount, errors } = summary;
  const hasErrors = errors.length > 0;

  return (
    <div className={`import-summary ${hasErrors ? 'import-summary--warning' : 'import-summary--success'}`}>
      <div className="import-summary__header">
        <span>
          {createdCount > 0 && `${createdCount} note${createdCount === 1 ? '' : 's'} imported successfully.`}
          {createdCount > 0 && hasErrors && ' '}
          {hasErrors && `${errors.length} note${errors.length === 1 ? '' : 's'} could not be imported.`}
          {createdCount === 0 && !hasErrors && 'No notes were imported.'}
        </span>
        <button type="button" onClick={onDismiss} aria-label="Dismiss import summary">✕</button>
      </div>

      {hasErrors && (
        <ul className="import-summary__errors">
          {errors.map((err, idx) => (
            <li key={idx}>{err.file ? `${err.file}: ` : ''}{err.message}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ImportSummaryBanner;
