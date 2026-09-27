'use client';
import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { errorMessage } from '@/lib/api';
import { submitApplication } from '@/lib/applications';
import type { ApplicationResult as ApplicationResultData } from '@/lib/types';
import ApplicationResult from '@/components/ApplicationResult';
import LoanApplicationForm from '@/components/LoanApplicationForm';

export default function ApplicationPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<ApplicationResultData | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setIsSubmitting(true);
    setError('');
    try {
      setResult(await submitApplication(form));
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

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
            <ApplicationResult
              result={result}
              onReset={() => setResult(null)}
            />
          ) : (
            <LoanApplicationForm
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              error={error}
            />
          )}
        </section>
      </main>
      <footer className="footer">
        MoneyBeing Private Limited · Loan Eligibility & Lead Management Module
      </footer>
    </>
  );
}
