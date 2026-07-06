"use client";

import React from "react";

function Bone({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-[var(--color-line)] ${className}`} />;
}

export function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <Bone className="h-8 w-48" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-card)] p-5 space-y-3">
            <Bone className="h-4 w-20" />
            <Bone className="h-8 w-16" />
            <Bone className="h-3 w-28" />
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Bone className="h-48 w-full rounded-2xl" />
          <Bone className="h-32 w-full rounded-2xl" />
        </div>
        <div className="space-y-4">
          <Bone className="h-40 w-full rounded-2xl" />
          <Bone className="h-40 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

export function MockTestSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="text-center space-y-3">
        <Bone className="h-9 w-64 mx-auto" />
        <Bone className="h-4 w-96 mx-auto" />
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-card)] p-6 space-y-4">
            <Bone className="h-5 w-40" />
            <Bone className="h-4 w-24" />
            <div className="flex gap-4">
              <Bone className="h-3 w-16" />
              <Bone className="h-3 w-16" />
            </div>
            <Bone className="h-10 w-full rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProgressSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-card)] p-6 flex items-center gap-6">
        <Bone className="w-24 h-24 rounded-full shrink-0" />
        <div className="space-y-3 flex-1">
          <Bone className="h-7 w-40" />
          <Bone className="h-4 w-56" />
          <div className="flex gap-3">
            <Bone className="h-6 w-24 rounded-full" />
            <Bone className="h-6 w-20 rounded-full" />
            <Bone className="h-6 w-28 rounded-full" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-card)] p-5 space-y-3">
            <Bone className="h-4 w-20" />
            <Bone className="h-8 w-16" />
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Bone className="h-52 w-full rounded-2xl" />
          <Bone className="h-44 w-full rounded-2xl" />
        </div>
        <div className="space-y-4">
          <Bone className="h-48 w-full rounded-2xl" />
          <Bone className="h-48 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
