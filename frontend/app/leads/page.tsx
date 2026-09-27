'use client';
import { useEffect, useState } from 'react';
import AdminShell from '@/components/AdminShell';
import Status from '@/components/Status';
import { api, apiResponse, errorMessage, money } from '@/lib/api';
import type { Lead, LeadPage } from '@/lib/types';

function LeadsContent() {
  const [data, setData] = useState<LeadPage | null>(null);
  const [search, setSearch] = useState('');
  const [loanType, setLoanType] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [selected, setSelected] = useState<Lead | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [refresh, setRefresh] = useState(0);
  const [notice, setNotice] = useState('');
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('id');
    if (id && /^\d+$/.test(id))
      api<Lead>(`/api/leads/${id}`)
        .then(setSelected)
        .catch((e) => setError(errorMessage(e)));
  }, []);
  const query = new URLSearchParams({
    search,
    ...(loanType && { loan_type: loanType }),
    ...(status && { bre_status: status }),
  }).toString();
  // Wait briefly while typing, and cancel stale requests when filters change.
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    const timeout = setTimeout(() => {
      api<LeadPage>(`/api/leads?${query}&page=${page}&page_size=10`, {
        signal: controller.signal,
      })
        .then(setData)
        .catch((e) => {
          if (!controller.signal.aborted) setError(errorMessage(e));
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 250);
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [page, query, refresh]);
  async function deleteApplication(lead: Lead) {
    if (deletingId !== null) return;
    if (
      !window.confirm(
        `Permanently delete application #${lead.id} for ${lead.full_name}? This cannot be undone.`,
      )
    )
      return;

    setDeletingId(lead.id);
    setError('');
    setNotice('');
    try {
      await api(`/api/leads/${lead.id}`, { method: 'DELETE' });
      setSelected((current) => (current?.id === lead.id ? null : current));
      setNotice(`Application #${lead.id} deleted.`);
      // Reload from the first page so deleting the last row cannot leave an empty page.
      setPage(1);
      setRefresh((value) => value + 1);
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setDeletingId(null);
    }
  }
  async function download() {
    setExporting(true);
    setError('');
    try {
      const response = await apiResponse(`/api/leads/export?${query}`);
      // Turn the authenticated response into a browser download, then release it.
      const url = URL.createObjectURL(await response.blob());
      const a = document.createElement('a');
      a.href = url;
      a.download = 'moneybeing-leads.xlsx';
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setExporting(false);
    }
  }
  return (
    <>
      <header className="page-heading">
        <div>
          <span className="eyebrow">Every application, in one place</span>
          <h1>Lead management</h1>
          <p>Search, review, and export your lending pipeline.</p>
        </div>
        <button className="secondary" disabled={exporting} onClick={download}>
          {exporting ? 'Exporting…' : '↓ Export Excel'}
        </button>
      </header>
      {error && (
        <div className="error" role="alert">
          {error}
        </div>
      )}
      {notice && <p role="status">{notice}</p>}
      <section className="card">
        <div className="toolbar">
          <input
            aria-label="Search name or mobile"
            placeholder="Search name or mobile…"
            maxLength={120}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          <select
            aria-label="Filter loan type"
            value={loanType}
            onChange={(e) => {
              setLoanType(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All loan types</option>
            <option>Home Loan</option>
            <option>LAP</option>
          </select>
          <select
            aria-label="Filter eligibility"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All statuses</option>
            <option>Eligible</option>
            <option>Not Eligible</option>
          </select>
        </div>
        <div className="table-wrap" aria-busy={loading}>
          <table>
            <thead>
              <tr>
                {[
                  'Lead ID',
                  'Customer name',
                  'Mobile',
                  'Loan type',
                  'Credit score',
                  'BRE status',
                  'Created date',
                  'Actions',
                ].map((title, i) => (
                  <th key={i} scope="col">
                    {title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!loading &&
                data?.items.map((lead) => (
                  <tr key={lead.id}>
                    <td>#{lead.id}</td>
                    <td className="font-semibold">{lead.full_name}</td>
                    <td>{lead.mobile}</td>
                    <td>{lead.loan_type}</td>
                    <td>{lead.credit_score ?? 'Unavailable'}</td>
                    <td>
                      <Status value={lead.bre_status} />
                    </td>
                    <td>
                      {new Date(lead.created_at).toLocaleDateString('en-IN')}
                    </td>
                    <td>
                      <button
                        className="secondary"
                        onClick={() => setSelected(lead)}
                      >
                        View
                      </button>
                      <button
                        className="secondary ml-2 text-red-700"
                        disabled={deletingId !== null}
                        aria-label={`Delete application ${lead.id}`}
                        onClick={() => deleteApplication(lead)}
                      >
                        {deletingId === lead.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          {loading ? (
            <p className="empty" role="status">
              Loading applications…
            </p>
          ) : (
            !data?.items.length && (
              <p className="empty">No leads match these filters.</p>
            )
          )}
        </div>
        <div className="pagination">
          <span>
            {data?.total ?? 0} leads · Page {page} of{' '}
            {Math.max(1, Math.ceil((data?.total ?? 0) / 10))}
          </span>
          <div className="actions">
            <button
              className="secondary"
              disabled={page === 1 || loading}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </button>
            <button
              className="secondary"
              disabled={loading || page * 10 >= (data?.total ?? 0)}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </section>
      {selected && (
        <section className="card mt-6" aria-label="Lead details">
          <div className="page-heading">
            <div>
              <span className="eyebrow">Application #{selected.id}</span>
              <h2 className="mt-3">{selected.full_name}</h2>
              <Status value={selected.bre_status} />
            </div>
            <button className="secondary" onClick={() => setSelected(null)}>
              Close details
            </button>
          </div>
          <dl className="detail-grid">
            {[
              ['Email', selected.email],
              ['Mobile', selected.mobile],
              ['Date of birth', selected.date_of_birth],
              ['Location', `${selected.city}, ${selected.pincode}`],
              ['Employment', selected.employment_type],
              ['Monthly income', money(selected.monthly_income)],
              ['Loan amount', money(selected.loan_amount)],
              ['Property value', money(selected.property_value)],
              ['Mock credit score', selected.credit_score ?? 'Unavailable'],
              [
                'Submitted',
                new Date(selected.created_at).toLocaleString('en-IN'),
              ],
            ].map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          {selected.credit_score_error && (
            <p className="error">{selected.credit_score_error}</p>
          )}
          {selected.rejection_reasons.length > 0 && (
            <div className="mt-5">
              <h3>Rejection reasons</h3>
              <ul className="list-disc pl-5">
                {selected.rejection_reasons.map((reason, i) => (
                  <li key={i}>{reason}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
    </>
  );
}
export default function Leads() {
  return (
    <AdminShell>
      <LeadsContent />
    </AdminShell>
  );
}
