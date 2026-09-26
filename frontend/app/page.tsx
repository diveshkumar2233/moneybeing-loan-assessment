'use client';
import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { apiResponse, errorMessage } from '@/lib/api';
import Status from '@/components/Status';

type Result = {
  lead_id: number;
  credit_score: number | null;
  bre_status: string;
  reasons: string[];
  warning: string | null;
};
export default function ApplicationPage() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    const form = new FormData(event.currentTarget);
    const data = Object.fromEntries(form.entries());
    try {
      const dob = new Date(`${data.date_of_birth}T00:00:00`);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (dob >= today || dob < new Date('1900-01-01T00:00:00'))
        throw new Error('Enter a valid date of birth before today.');
      if (
        String(data.full_name).trim().length < 2 ||
        String(data.city).trim().length < 2
      )
        throw new Error('Name and city must contain at least two characters.');
      const response = await apiResponse(
        '/api/leads',
        {
          method: 'POST',
          body: JSON.stringify({
            ...data,
            consent: form.get('consent') === 'on',
          }),
        },
        false,
      );
      setResult({
        ...(await response.json()),
        reasons: JSON.parse(
          response.headers.get('X-Rejection-Reasons') || '[]',
        ),
        warning: response.headers.get('X-Credit-Score-Error'),
      });
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  const input = (name: string, label: string, type = 'text', extra = {}) => (
    <label key={name}>
      {label}
      <input name={name} type={type} required {...extra} />
    </label>
  );
  return (
    <>
      <header className="topbar">
        <Link className="brand" href="/">
          MoneyBeing<span>YOUR NEXT CHAPTER STARTS HERE</span>
        </Link>
        <Link href="/login">Admin sign in ↗</Link>
      </header>
      <main className="page application-layout">
        <section className="intro">
          <span className="eyebrow">A little clarity. A big step forward.</span>
          <h1>
            A place to call yours.
            <br />
            <span className="text-emerald-700">A loan to get there.</span>
          </h1>
          <p>
            Check your eligibility for a home loan or a loan against property in
            a few simple steps.
          </p>
          <div className="steps">
            <div className="step">
              <b>01</b>
              <span>Tell us a little about yourself</span>
            </div>
            <div className="step">
              <b>02</b>
              <span>Share your loan requirements</span>
            </div>
            <div className="step">
              <b>03</b>
              <span>Get your eligibility assessment</span>
            </div>
          </div>
          <p className="mock-note">
            Assessment demo · Credit scores are simulated. Results are
            indicative and do not constitute a lending decision.
          </p>
        </section>
        <section className="card">
          {result ? (
            <div className="result" role="status">
              <span className="eyebrow">
                Application received · #{result.lead_id}
              </span>
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
                  You meet the current eligibility criteria. Your application
                  has been recorded for review.
                </p>
              )}
              <p className="muted">
                Keep your application ID for reference. Final approval is
                subject to lending partner verification.
              </p>
              <button
                className="secondary mt-5"
                onClick={() => setResult(null)}
              >
                Submit another application
              </button>
            </div>
          ) : (
            <form onSubmit={submit}>
              <section className="form-section">
                <div className="section-heading">
                  <span className="section-number">01</span>
                  <h2>Customer details</h2>
                </div>
                <div className="form-grid">
                  {input('full_name', 'Full name', 'text', {
                    minLength: 2,
                    maxLength: 120,
                    autoComplete: 'name',
                    placeholder: 'As on your identity document',
                  })}
                  {input('mobile', 'Mobile number', 'tel', {
                    pattern: '[0-9]{10}',
                    maxLength: 10,
                    inputMode: 'numeric',
                    autoComplete: 'tel-national',
                    title: 'Enter exactly 10 digits',
                  })}
                  {input('email', 'Email address', 'email', {
                    maxLength: 254,
                    autoComplete: 'email',
                  })}
                  {input('date_of_birth', 'Date of birth', 'date', {
                    min: '1900-01-01',
                    max: new Date(Date.now() - 86400000).toLocaleDateString(
                      'en-CA',
                    ),
                  })}
                  {input('city', 'City', 'text', {
                    minLength: 2,
                    maxLength: 100,
                    autoComplete: 'address-level2',
                  })}
                  {input('pincode', 'Pincode', 'text', {
                    pattern: '[1-9][0-9]{5}',
                    maxLength: 6,
                    inputMode: 'numeric',
                    autoComplete: 'postal-code',
                    title: 'Enter a valid 6-digit pincode',
                  })}
                </div>
              </section>
              <section className="form-section">
                <div className="section-heading">
                  <span className="section-number">02</span>
                  <h2>Loan details</h2>
                </div>
                <div className="form-grid">
                  <label>
                    Loan type
                    <select name="loan_type" required defaultValue="">
                      <option value="" disabled>
                        Select loan type
                      </option>
                      <option>Home Loan</option>
                      <option value="LAP">Loan Against Property (LAP)</option>
                    </select>
                  </label>
                  <label>
                    Employment type
                    <select name="employment_type" required defaultValue="">
                      <option value="" disabled>
                        Select employment type
                      </option>
                      <option>Salaried</option>
                      <option>Self Employed</option>
                    </select>
                  </label>
                  {input('monthly_income', 'Monthly income (₹)', 'number', {
                    min: '.01',
                    max: '99999999999999.99',
                    step: '.01',
                  })}
                  {input('loan_amount', 'Loan amount required (₹)', 'number', {
                    min: '.01',
                    max: '99999999999999.99',
                    step: '.01',
                  })}
                  {input('property_value', 'Property value (₹)', 'number', {
                    min: '.01',
                    max: '99999999999999.99',
                    step: '.01',
                  })}
                </div>
              </section>
              <label className="consent">
                <input type="checkbox" name="consent" required />
                <span>
                  I consent that customer information will be shared with
                  lending partners for loan processing.
                </span>
              </label>
              {error && (
                <div className="error" role="alert">
                  {error}
                </div>
              )}
              <div className="submit-row">
                <small>
                  All fields are required. Your information is used for this
                  loan assessment.
                </small>
                <button disabled={busy} type="submit">
                  {busy ? 'Assessing application…' : 'Check eligibility →'}
                </button>
              </div>
            </form>
          )}
        </section>
      </main>
      <footer className="footer">
        MoneyBeing Private Limited · Loan Eligibility & Lead Management Module
      </footer>
    </>
  );
}
