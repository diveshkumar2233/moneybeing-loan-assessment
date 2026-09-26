'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import AdminShell from '@/components/AdminShell';
import Status from '@/components/Status';
import { api, errorMessage } from '@/lib/api';
import type { Summary, LeadPage } from '@/lib/types';

function DashboardContent() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [leads, setLeads] = useState<LeadPage | null>(null);
  const [error, setError] = useState('');
  async function load() {
    setError('');
    try {
      const [s, l] = await Promise.all([
        api<Summary>('/api/dashboard/summary'),
        api<LeadPage>('/api/leads?page_size=5'),
      ]);
      setSummary(s);
      setLeads(l);
    } catch (e) {
      setError(errorMessage(e));
    }
  }
  useEffect(() => {
    void load();
  }, []);
  return (
    <>
      <header className="page-heading">
        <div>
          <span className="eyebrow">Your lending pipeline</span>
          <h1>Overview</h1>
          <p>A clear view of every application.</p>
        </div>
        <button className="secondary" onClick={load}>
          Refresh
        </button>
      </header>
      {error && (
        <div role="alert" className="error">
          {error}
        </div>
      )}
      {!summary ? (
        <p role="status">
          {error ? 'Data could not be loaded.' : 'Loading dashboard…'}
        </p>
      ) : (
        <>
          <div className="stats">
            {[
              ['Total leads', summary.total_leads],
              ['Eligible leads', summary.eligible_leads],
              ['Rejected leads', summary.rejected_leads],
              ['Average credit score', summary.average_credit_score ?? '—'],
            ].map(([label, value]) => (
              <div className="card stat" key={label}>
                <p>{label}</p>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
          <div className="dashboard-grid">
            <section className="card">
              <h2>Eligibility breakdown</h2>
              {summary.total_leads === 0 ? (
                <p className="empty">
                  No applications yet. Results will appear here.
                </p>
              ) : (
                <>
                  <div className="chart">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { name: 'Eligible', count: summary.eligible_leads },
                          {
                            name: 'Not Eligible',
                            count: summary.rejected_leads,
                          },
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar
                          dataKey="count"
                          name="Applications"
                          fill="#257657"
                          radius={[6, 6, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="muted text-xs">
                    {summary.eligible_leads} eligible · {summary.rejected_leads}{' '}
                    not eligible
                  </p>
                </>
              )}
            </section>
            <section className="card">
              <h2>Latest applications</h2>
              {leads?.items.length ? (
                leads.items.map((lead) => (
                  <div
                    key={lead.id}
                    className="flex justify-between gap-3 border-b border-emerald-50 py-4"
                  >
                    <div>
                      <Link href={`/leads?id=${lead.id}`}>
                        {lead.full_name}
                      </Link>
                      <p className="muted text-xs m-0">
                        #{lead.id} · {lead.loan_type}
                      </p>
                    </div>
                    <Status value={lead.bre_status} />
                  </div>
                ))
              ) : (
                <p className="empty">
                  Your first application starts the story.
                </p>
              )}
              <Link className="inline-block mt-5" href="/leads">
                View all leads →
              </Link>
            </section>
          </div>
          <p className="muted text-xs mt-6">
            Credit scores are mock values. Unavailable scores are excluded from
            the average. Results reflect the rules active at application time.
          </p>
        </>
      )}
    </>
  );
}
export default function Dashboard() {
  return (
    <AdminShell>
      <DashboardContent />
    </AdminShell>
  );
}
