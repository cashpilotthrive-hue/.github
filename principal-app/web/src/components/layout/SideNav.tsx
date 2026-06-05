import React from "react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "#" },
  { label: "Activity", href: "#activity" },
  { label: "Credits", href: "#credits" },
  { label: "Chat", href: "#chat" },
];

const SideNav: React.FC = () => (
  <nav className="w-52 bg-slate-900 border-r border-slate-800 flex flex-col py-6 gap-1 shrink-0">
    <div className="px-4 mb-4 text-xs font-bold uppercase tracking-widest text-slate-500">
      Menu
    </div>
    {NAV_ITEMS.map(({ label, href }) => (
      <a
        key={label}
        href={href}
        className="px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white rounded mx-2 transition-colors"
      >
        {label}
      </a>
    ))}
  </nav>
);

export default SideNav;
