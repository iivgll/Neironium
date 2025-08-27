import React, { ReactNode } from 'react';
import '@/styles/App.css';
import AppWrappers from './AppWrappers';
import ClientLayout from '@/components/ClientLayout';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" style={{ height: '100%' }}>
      <head>
        <title>Neuronium AI</title>
        <meta name="description" content="AI ассистент" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
        />
        <meta name="theme-color" content="#151515" />
        <script
          src="https://telegram.org/js/telegram-web-app.js"
          async
        ></script>
      </head>
      <body id={'root'} style={{ height: '100%', overflow: 'hidden' }}>
        <AppWrappers>
          <ClientLayout>{children}</ClientLayout>
        </AppWrappers>
      </body>
    </html>
  );
}
