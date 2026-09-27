import Status from '@/components/Status';
import type { ApplicationResult as Result } from '@/lib/types';

type Props = { result: Result; onReset: () => void };

export default function ApplicationResult({ result, onReset }: Props) {
  return (
    <div className="result" role="status">
      <span className="eyebrow">Application received · #{result.lead_id}</span>
      <h2 className="mt-5">Your eligibility assessment</h2>
      <Status value={result.bre_status} />
      <p className="muted mt-6">Mock credit score</p>
      <div className="result-score">
        {result.credit_score ?? 'Unavailable'}
        {result.credit_score !== null && (
          <small className="text-base tracking-normal"> / 900</small>
        )}
      </div>
      {result.warning && <p className="error">{result.warning}</p>}
      {result.reasons.length > 0 ? (
        <>
          <h3 className="mt-6">What affected this result</h3>
          <ul>
            {result.reasons.map((reason, i) => (
              <li key={i}>{reason}</li>
            ))}
          </ul>
        </>
      ) : (
        <p>
          You meet the current eligibility criteria. Your application has been
          recorded for review.
        </p>
      )}
      <p className="muted">
        Keep your application ID for reference. Final approval is subject to
        lending partner verification.
      </p>
      <button className="secondary mt-5" onClick={onReset}>
        Submit another application
      </button>
    </div>
  );
}
