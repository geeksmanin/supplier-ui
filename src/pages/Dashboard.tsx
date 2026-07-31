import React from 'react';

export function Dashboard() {
  return (
    <div className="p-6 bg-slate-900 min-h-screen text-slate-100">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Supplier Portal Dashboard
        </h1>
        <p className="text-slate-400 mt-2">
          Manage your products, variant specifications, packings, and monitor catalogue listings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/10">
          <div className="text-sm font-semibold text-slate-400">Total Products</div>
          <div className="text-3xl font-bold mt-2 text-blue-400">12</div>
          <div className="text-xs text-slate-500 mt-2">Across all categories</div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/10">
          <div className="text-sm font-semibold text-slate-400">Active SKUs</div>
          <div className="text-3xl font-bold mt-2 text-emerald-400">38</div>
          <div className="text-xs text-slate-500 mt-2">Currently visible in marketplace</div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/10">
          <div className="text-sm font-semibold text-slate-400">Linked Mappings</div>
          <div className="text-3xl font-bold mt-2 text-purple-400">9</div>
          <div className="text-xs text-slate-500 mt-2">Mapped to internal Geeksman products</div>
        </div>
      </div>
    </div>
  );
}
