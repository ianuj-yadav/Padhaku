import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PADHAKU — Smart Study Hub',
  description: 'Organize student notes, extract text from study PDFs, and ask questions with page-level source references.',
  icons: { icon: '/logo.svg' },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
