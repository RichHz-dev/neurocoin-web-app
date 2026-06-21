import { useState } from 'react';

// Hooks
import { useMarketData } from './hooks/useMarketData.js';
import { useChat } from './hooks/useChat.js';
import { useAlerts } from './hooks/useAlerts.js';
import { useNotification } from './hooks/useNotification.js';

// Componentes UI - Layout
import Header from './components/layout/Header.jsx';
import Banner from './components/layout/Banner.jsx';
import Footer from './components/layout/Footer.jsx';

// Componentes UI - Common
import NotificationToast from './components/common/NotificationToast.jsx';
import NavigationTabs from './components/common/NavigationTabs.jsx';

// Paneles
import CryptoPanel from './components/CryptoPanel.jsx';
import ScenarioPanel from './components/ScenarioPanel.jsx';
import AssistantPanel from './components/AssistantPanel.jsx';

export default function App() {
  const [activeTab, setActiveTab] = useState('cryptos');

  const { notification, triggerNotification } = useNotification();
  const { alerts, handleAddAlert, handleDeleteAlert } = useAlerts();
  const { cryptos, selectedCoin, setSelectedCoin } = useMarketData(10000);
  const { chatHistory, isChatLoading, handleSendMessage } = useChat();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans relative overflow-x-hidden antialiased">
      <NotificationToast notification={notification} />

      {/* Luces ambientales */}
      <div className="absolute top-0 left-1/4 w-[480px] h-[480px] bg-pink-900/5 rounded-full blur-[110px] -z-10 pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[380px] h-[380px] bg-indigo-900/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

      <Header />

      <main className="max-w-7xl mx-auto w-full px-4 py-6 flex-1 flex flex-col justify-start">
        <Banner />
        <NavigationTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        <section className="flex-1 min-h-[400px]">
          {activeTab === 'cryptos' && (
            <CryptoPanel
              cryptos={cryptos}
              selectedCoin={selectedCoin}
              onSelectCoin={setSelectedCoin}
              alerts={alerts}
              onAddAlert={handleAddAlert}
              onDeleteAlert={handleDeleteAlert}
              triggerNotification={triggerNotification}
            />
          )}
          {activeTab === 'scenarios' && (
            <ScenarioPanel
              cryptos={cryptos}
              selectedCoin={selectedCoin}
              triggerNotification={triggerNotification}
            />
          )}
          {activeTab === 'chat' && (
            <AssistantPanel
              chatHistory={chatHistory}
              onSendMessage={handleSendMessage}
              isChatLoading={isChatLoading}
              triggerNotification={triggerNotification}
            />
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}