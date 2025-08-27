'use client';
import React from 'react';
import { LoadingScreen } from './LoadingScreen';

export function ClientLoadingScreen() {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // На сервере возвращаем простой плейсхолдер
  if (!mounted) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#151515',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
      }}>
        <div style={{ color: '#8854F3' }}>Инициализация...</div>
      </div>
    );
  }

  // После монтирования показываем полноценный LoadingScreen с анимациями
  return <LoadingScreen />;
}