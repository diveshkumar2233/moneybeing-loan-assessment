import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'MoneyBeing | Loan Eligibility',
  description:
    'Apply for a home loan or loan against property with MoneyBeing.',
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
