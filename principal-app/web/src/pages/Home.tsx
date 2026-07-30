import React from "react";
import AppLayout from "../components/layout/AppLayout";
import MoneyStrip from "../components/dashboard/MoneyStrip";
import ActivityFeed from "../components/dashboard/ActivityFeed";
import CreditTicker from "../components/dashboard/CreditTicker";
import ChatWindow from "../components/chat/ChatWindow";

const Home: React.FC = () => (
  <AppLayout>
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Wealth overview */}
      <section id="dashboard">
        <MoneyStrip />
      </section>

      {/* Activity + Credits side by side */}
      <section id="activity" className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ActivityFeed />
        <CreditTicker />
      </section>

      {/* Chat interface */}
      <section id="chat" className="h-[520px] flex flex-col">
        <ChatWindow />
      </section>
    </div>
  </AppLayout>
);

export default Home;
