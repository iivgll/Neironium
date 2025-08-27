import React from 'react';

export default function RootHead() {
  return (
    <>
      <title>Neuronium AI</title>
      <meta name="description" content="AI ассистент в Telegram" />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
      />

      {/* Telegram Web App Script - must be loaded before any other scripts */}
      <script
        src="https://telegram.org/js/telegram-web-app.js?59"
        async={false}
      />
    </>
  );
}
