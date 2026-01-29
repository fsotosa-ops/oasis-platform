// src/app/(platform)/layout.tsx
import React from 'react';
import { AuthProvider } from '@/features/auth/context/AuthProvider';
import { ViewModeProvider } from '@/frontend/context/ViewModeContext';
import { Sidebar } from '@/shared/components/layout/Sidebar'; 
import { Header } from '@/shared/components/layout/Header'; // Asumiendo que usas este header

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    /* 1. AuthProvider primero (autenticación base) */
    <AuthProvider>
      {/* 2. ViewModeProvider envuelve TODO el contenido visible, incluido el Sidebar */}
      <ViewModeProvider>
        <div className="flex h-screen bg-gray-50 overflow-hidden">
          {/* Al estar dentro del Provider, el Sidebar ya puede usar useViewMode */}
          <Sidebar />
          
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header />
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
              {children}
            </main>
          </div>
        </div>
      </ViewModeProvider>
    </AuthProvider>
  );
}