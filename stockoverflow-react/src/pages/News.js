import React, { useState } from 'react';
import '../styles/News.css';

function News() {
  const [activeCategory, setActiveCategory] = useState('all');

  const newsData = [
    {
      id: 1,
      category: 'stocks',
      title: 'Tesla Q1 Earnings Beat Expectations',
      source: 'Market Watch',
      time: '2 hours ago',
      image: 'https://via.placeholder.com/300x200',
      summary: 'Tesla reported strong Q1 earnings, surpassing Wall Street expectations with record deliveries and improved margins.',
    },
    {
      id: 2,
      category: 'crypto',
      title: 'Bitcoin Surges Past $45,000',
      source: 'CoinDesk',
      time: '4 hours ago',
      image: 'https://via.placeholder.com/300x200',
      summary: 'Bitcoin continues its bullish trend, breaking through the $45,000 resistance level amid increased institutional adoption.',
    },
    {
      id: 3,
      category: 'economy',
      title: 'Fed Signals Potential Rate Hike',
      source: 'Reuters',
      time: '6 hours ago',
      image: 'https://via.placeholder.com/300x200',
      summary: 'Federal Reserve officials hint at possible interest rate increases in response to rising inflation concerns.',
    },
    {
      id: 4,
      category: 'stocks',
      title: 'Apple Announces New Product Line',
      source: 'CNBC',
      time: '8 hours ago',
      image: 'https://via.placeholder.com/300x200',
      summary: 'Apple unveils new product lineup at annual event, including revolutionary AI-powered devices.',
    },
    {
      id: 5,
      category: 'crypto',
      title: 'Ethereum 2.0 Update Progress',
      source: 'The Block',
      time: '10 hours ago',
      image: 'https://via.placeholder.com/300x200',
      summary: 'Ethereum developers report significant progress on the 2.0 upgrade, promising improved scalability and efficiency.',
    },
  ];

  const filteredNews = activeCategory === 'all' 
    ? newsData 
    : newsData.filter(news => news.category === activeCategory);

  return (
    <div className="news-page">
      <div className="container">
        <h1>Market News</h1>
        
        <div className="news-categories">
          <button 
            className={`category ${activeCategory === 'all' ? 'active' : ''}`}
            onClick={() => setActiveCategory('all')}
          >
            All News
          </button>
          <button 
            className={`category ${activeCategory === 'stocks' ? 'active' : ''}`}
            onClick={() => setActiveCategory('stocks')}
          >
            Stocks
          </button>
          <button 
            className={`category ${activeCategory === 'crypto' ? 'active' : ''}`}
            onClick={() => setActiveCategory('crypto')}
          >
            Crypto
          </button>
          <button 
            className={`category ${activeCategory === 'economy' ? 'active' : ''}`}
            onClick={() => setActiveCategory('economy')}
          >
            Economy
          </button>
        </div>

        <div className="news-grid">
          {filteredNews.map((news) => (
            <div key={news.id} className="news-card">
              <img src={news.image} alt={news.title} />
              <div className="news-content">
                <span className="news-category">{news.category}</span>
                <h3>{news.title}</h3>
                <p>{news.summary}</p>
                <div className="news-meta">
                  <span className="source">{news.source}</span>
                  <span className="time">{news.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default News; 