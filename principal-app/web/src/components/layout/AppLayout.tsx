import React from "react";
import TopBar from "./TopBar";
import SideNav from "./SideNav";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => (
  <div className="flex h-screen overflow-hidden">
    <SideNav />
    <div className="flex flex-col flex-1 overflow-hidden">
      <TopBar />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  </div>
);

export default AppLayout;
