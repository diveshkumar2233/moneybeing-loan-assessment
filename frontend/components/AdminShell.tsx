'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { api, TOKEN_KEY, errorMessage } from '@/lib/api';

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    if (!sessionStorage.getItem(TOKEN_KEY)) {
      router.replace('/login');
      return;
    }
    api<{ email: string; role: string }>('/api/auth/me')
      .then((user) => {
        if (user.role !== 'admin') {
          setError('Administrator access required.');
          return;
        }
        setEmail(user.email);
      })
      .catch((e) => setError(errorMessage(e)));
  }, [router]);
  if (!email)
    return (
      <main className="page">
        <p role={error ? 'alert' : 'status'}>
          {error || 'Checking your session…'}
        </p>
        <Link href="/login">Back to sign in</Link>
      </main>
    );
  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <Link className="brand" href="/">
          MoneyBeing<span>ADMIN WORKSPACE</span>
        </Link>
        <nav>
          {[
            ['/dashboard', 'Overview'],
            ['/leads', 'Lead management'],
            ['/rules', 'Business rules'],
          ].map(([href, label]) => (
            <Link
              key={href}
              className={pathname === href ? 'active' : ''}
              href={href}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <small>{email}</small>
          <button
            className="secondary"
            onClick={() => {
              sessionStorage.removeItem(TOKEN_KEY);
              router.replace('/login');
            }}
          >
            Sign out
          </button>
          <Link href="/">Open application form ↗</Link>
        </div>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}
