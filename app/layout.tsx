import React, { ReactNode } from 'react';
import '@/styles/App.css';
import AppWrappers from './AppWrappers';
import ClientLayout from '@/components/layout/ClientLayout';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      style={
        {
          '--tg-viewport-height': '100vh',
          '--tg-viewport-stable-height': '100vh',
        } as React.CSSProperties
      }
    >
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
      <body id={'root'}>
        <AppWrappers>
          <ClientLayout>{children}</ClientLayout>
        </AppWrappers>
      </body>
    </html>
  );
}
