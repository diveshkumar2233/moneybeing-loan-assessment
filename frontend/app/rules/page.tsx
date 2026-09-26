'use client';
import { useEffect, useState, type FormEvent } from 'react';
import AdminShell from '@/components/AdminShell';
import { api, errorMessage } from '@/lib/api';
import type { Rule } from '@/lib/types';

const fields: Record<string, string> = {
  age: 'Age',
  monthly_income: 'Monthly Income',
  credit_score: 'Credit Score',
  loan_amount: 'Loan Amount',
  property_value: 'Property Value',
};
const blank: Omit<Rule, 'id'> = {
  rule_name: '',
  field: 'age',
  operator: '>=',
  value: '',
  reference_field: null,
  rejection_message: '',
  is_active: true,
};

function RulesContent() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState(blank);
  const [busy, setBusy] = useState(false);
  async function load() {
    try {
      setRules(await api<Rule[]>('/api/rules'));
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void load();
  }, []);
  async function save(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await api(`/api/rules${editing === null ? '' : `/${editing}`}`, {
        method: editing === null ? 'POST' : 'PUT',
        body: JSON.stringify(form),
      });
      setOpen(false);
      setNotice('Rule saved. It will apply to future applications.');
      await load();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  async function remove(rule: Rule) {
    if (
      !window.confirm(
        `Delete “${rule.rule_name}”? Future applications will no longer use this rule.`,
      )
    )
      return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await api(`/api/rules/${rule.id}`, { method: 'DELETE' });
      if (editing === rule.id) setOpen(false);
      setNotice('Rule deleted. Existing lead decisions are preserved.');
      await load();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <header className="page-heading">
        <div>
          <span className="eyebrow">Configure your eligibility criteria</span>
          <h1>Business rules</h1>
          <p>Changes apply to future applications as soon as you save.</p>
        </div>
        <button
          disabled={busy}
          onClick={() => {
            setForm({ ...blank });
            setEditing(null);
            setOpen(true);
            setNotice('');
          }}
        >
          + Add rule
        </button>
      </header>
      {error && (
        <div role="alert" className="error">
          {error}
        </div>
      )}
      {notice && (
        <div role="status" className="success">
          {notice}
        </div>
      )}
      {open && (
        <form onSubmit={save} className="card rule-form">
          <h2>{editing === null ? 'Create rule' : `Edit rule #${editing}`}</h2>
          <div className="form-grid">
            <label className="full">
              Rule name
              <input
                required
                minLength={2}
                maxLength={120}
                value={form.rule_name}
                onChange={(e) =>
                  setForm({ ...form, rule_name: e.target.value })
                }
              />
            </label>
            <label>
              Field
              <select
                value={form.field}
                onChange={(e) => setForm({ ...form, field: e.target.value })}
              >
                {Object.entries(fields).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Operator
              <select
                value={form.operator}
                onChange={(e) => setForm({ ...form, operator: e.target.value })}
              >
                {['>=', '<=', '==', '!=', '>', '<'].map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </label>
            <label>
              {form.reference_field ? 'Percentage (%)' : 'Threshold value'}
              <input
                type="number"
                required
                min="0"
                max="99999999999999.99"
                step=".01"
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
              />
            </label>
            <label>
              Compare against
              <select
                value={form.reference_field ?? ''}
                onChange={(e) =>
                  setForm({ ...form, reference_field: e.target.value || null })
                }
              >
                <option value="">Fixed threshold</option>
                {Object.entries(fields).map(([key, value]) => (
                  <option key={key} value={key}>
                    Percentage of {value}
                  </option>
                ))}
              </select>
            </label>
            <label className="full">
              Rejection message
              <input
                required
                minLength={3}
                maxLength={255}
                value={form.rejection_message}
                onChange={(e) =>
                  setForm({ ...form, rejection_message: e.target.value })
                }
              />
            </label>
          </div>
          <label className="consent">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) =>
                setForm({ ...form, is_active: e.target.checked })
              }
            />
            Active — evaluate this rule on new applications
          </label>
          <div className="actions">
            <button disabled={busy}>{busy ? 'Saving…' : 'Save rule'}</button>
            <button
              type="button"
              className="secondary"
              disabled={busy}
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
      {loading ? (
        <p role="status">Loading rules…</p>
      ) : rules.length === 0 ? (
        <section className="card empty">
          No rules configured. Applications with an available credit score will
          pass until you add active rules.
        </section>
      ) : (
        rules.map((rule) => (
          <section key={rule.id} className="card rule-card">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="m-0">{rule.rule_name}</h3>
                <span
                  className={`badge ${rule.is_active ? 'positive' : 'negative'}`}
                >
                  {rule.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="rule-expression mt-3">
                {fields[rule.field]} {rule.operator} {rule.value}
                {rule.reference_field && `% of ${fields[rule.reference_field]}`}
              </div>
              <p>{rule.rejection_message}</p>
            </div>
            <div className="actions">
              <button
                className="secondary"
                disabled={busy}
                onClick={() => {
                  const { id, ...values } = rule;
                  setEditing(id);
                  setForm(values);
                  setOpen(true);
                  setNotice('');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                Edit
              </button>
              <button
                className="danger"
                disabled={busy}
                onClick={() => remove(rule)}
              >
                Delete
              </button>
            </div>
          </section>
        ))
      )}
      <p className="muted text-xs mt-6">
        All active rules must pass. A percentage rule compares its field to
        (reference field × percentage ÷ 100). Existing applications keep their
        original decision and evaluated rule snapshot.
      </p>
    </>
  );
}
export default function Rules() {
  return (
    <AdminShell>
      <RulesContent />
    </AdminShell>
  );
}
