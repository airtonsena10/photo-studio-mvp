import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Anju fotografia - Sistema de Gestão',
    template: '%s | Anju fotografia'
  },
  description: 'Sistema completo de gestão para estúdios de fotografia. Gerencie clientes, sessões, agenda e financeiro de forma simples e eficiente.',
  keywords: [
    'gestão estúdio fotografia',
    'sistema fotógrafo',
    'agenda sessões foto',
    'controle clientes fotografia',
    'gerenciamento estúdio'
  ],
  authors: [{ name: 'Airton Sena' }],
  creator: 'Airton Sena',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://fotostudio-pro.vercel.app',
    title: 'Anju fotografia - Sistema de Gestão',
    description: 'Sistema completo de gestão para estúdios de fotografia',
    siteName: 'Anju fotografia',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Anju fotografia - Sistema de Gestão',
    description: 'Sistema completo de gestão para estúdios de fotografia',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <div className="relative flex min-h-screen flex-col">
          <div className="flex-1">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}