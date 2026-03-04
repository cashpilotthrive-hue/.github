import React, { useState, useEffect } from 'react';

const DraggableWidget = ({ children }) => <div>{children}</div>;
const WealthWidget = () => <div>Wealth Widget</div>;
const TradingWidget = () => <div>Trading Widget</div>;
const CryptoWidget = () => <div>Crypto Widget</div>;
const RealEstateWidget = () => <div>Real Estate Widget</div>;

const NewsItem = ({ item }) => (
    <div className="text-sm text-gray-300 mb-2">
        <span className="font-bold text-cyan-400">[{item.industry}]</span> {item.title}
    </div>
);

const NewsWidget = ({ industries }) => {
  const [news, setNews] = useState([]);

  useEffect(() => {
    const fetchNews = async () => {
      // Mock news data
      const mockNews = industries.map(ind => ({
        id: Math.random(),
        industry: ind,
        title: `Big gains in ${ind} sector today!`
      }));
      setNews(mockNews);
    };

    fetchNews();
    const interval = setInterval(fetchNews, 60000);
    return () => clearInterval(interval);
  }, [industries]);

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-3">Your Personalized News</h3>
      {news.slice(0, 5).map(item => (
        <NewsItem key={item.id} item={item} />
      ))}
    </div>
  );
};

const PersonalizedWidgets = ({ userPreferences }) => {
  const defaultOrder = [
    { id: 'wealth', type: 'wealth' },
    { id: 'trading', type: 'trading' },
    { id: 'news', type: 'news' },
    { id: 'crypto', type: 'crypto' },
    { id: 'realestate', type: 'realestate' }
  ];

  const [widgetOrder, setWidgetOrder] = useState(
    userPreferences.mostUsed || defaultOrder
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {widgetOrder.map((widget, index) => (
        <DraggableWidget
          key={widget.id}
          widget={widget}
          priority={index}
        >
          {widget.type === 'wealth' && <WealthWidget />}
          {widget.type === 'trading' && <TradingWidget />}
          {widget.type === 'news' && <NewsWidget industries={userPreferences.interests} />}
          {widget.type === 'crypto' && <CryptoWidget coins={userPreferences.favoriteCoins} />}
          {widget.type === 'realestate' && <RealEstateWidget locations={userPreferences.cities} />}
        </DraggableWidget>
      ))}
    </div>
  );
};

export default PersonalizedWidgets;
