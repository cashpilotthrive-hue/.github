import React from "react";

const TopBar: React.FC = () => (
  <header className="flex items-center justify-between px-6 py-3 border-b border-slate-800 bg-slate-900">
    <span className="text-lg font-semibold tracking-tight">Principal App</span>
    <span className="text-xs text-slate-400">Wealth Command Center</span>
  </header>
);

export default TopBar;
