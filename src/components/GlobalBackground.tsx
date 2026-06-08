import React from 'react';

export const GlobalBackground = () => {
  return (
    <div className="fixed inset-0 z-[-10] bg-bg-primary overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(79,124,255,0.15),transparent_40%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(0,255,200,0.08),transparent_40%)]" />
    </div>
  );
};
