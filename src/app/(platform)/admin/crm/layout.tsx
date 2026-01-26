import React from 'react';

export default function CrmLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-full space-y-6 p-8">
       {/* Global Title removed to avoid duplication with simplified page */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
