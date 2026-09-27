'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { api, errorMessage, TOKEN_KEY } from '@/lib/api';

export default function Login() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    const data = new FormData(event.currentTarget);
    try {
      const token = await api<{ access_token: string }>(
        '/api/auth/login',
        {
          method: 'POST',
          body: new URLSearchParams({
            username: String(data.get('email')),
            password: String(data.get('password')),
          }),
        },
        false,
      );
      sessionStorage.setItem(TOKEN_KEY, token.access_token);
      router.replace('/dashboard');
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="login-wrap">
      <Link className="brand" href="/">
        MoneyBeing
      </Link>
      <section className="card mt-8">
        <span className="eyebrow">Admin workspace</span>
        <h1>Welcome back.</h1>
        <p className="muted">
          Sign in to manage applications and eligibility rules.
        </p>
        <form method="post" onSubmit={submit}>
          <label>
            Email address
            <input type="email" name="email" autoComplete="username" required />
          </label>
          <label>
            Password
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              required
            />
          </label>
          {error && (
            <div className="error" role="alert">
              {error}
            </div>
          )}
          <button disabled={busy}>{busy ? 'Signing in…' : 'Sign in →'}</button>
        </form>
      </section>
      <p>
        <Link href="/">← Back to loan application</Link>
      </p>
    </main>
  );
}
