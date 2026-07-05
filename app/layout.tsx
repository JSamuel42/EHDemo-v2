import type { Metadata } from 'next';
import { Source_Sans_3, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  variable: '--font-source-sans',
  display: 'swap',
});

const ibmMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-ibm-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Evidence Hub™ — Socialisation Demo',
  description: "Demo environment for Evidence Hub's evidence socialisation capabilities.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${sourceSans.variable} ${ibmMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
