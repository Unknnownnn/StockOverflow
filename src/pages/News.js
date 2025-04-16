import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { FiSearch, FiExternalLink, FiClock } from 'react-icons/fi';
import '../styles/News.css';

function News() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  const categories = {
    all: 'general',
    stocks: 'general',
    crypto: 'crypto',
    economy: 'forex'
  };

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get API key and validate it
        const apiKey = process.env.REACT_APP_FINNHUB_API_KEY;
        console.log('API Key available:', !!apiKey); // Debug log
        
        if (!apiKey) {
          console.error('API key is missing. Please check your .env file.');
          throw new Error('API configuration error');
        }

        // Log the request details (without the full API key)
        console.log('Fetching news for category:', categories[activeCategory]);
        console.log('API Key length:', apiKey.length);
        
        const response = await axios.get('https://finnhub.io/api/v1/news', {
          params: {
            category: categories[activeCategory],
            token: apiKey
          },
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 10000
        });

        // Log response status
        console.log('API Response status:', response.status);
        console.log('Data received:', !!response.data);
        
        if (!response.data || !Array.isArray(response.data)) {
          console.error('Invalid response format:', typeof response.data);
          throw new Error('Invalid API response format');
        }

        const transformedNews = response.data
          .filter(item => item.headline && item.summary)
          .map(item => ({
            id: item.id || Math.random().toString(36).substr(2, 9),
            category: item.category || categories[activeCategory],
            title: item.headline,
            source: item.source,
            datetime: item.datetime * 1000,
            image: item.image || 'https://via.placeholder.com/300x200',
            summary: item.summary,
            url: item.url
          }));

        console.log('Transformed news items:', transformedNews.length);

        if (transformedNews.length === 0) {
          throw new Error('No news articles found');
        }

        setNews(transformedNews);
        setError(null);
        setRetryCount(0);
      } catch (err) {
        console.error('Detailed error:', {
          message: err.message,
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data
        });

        let errorMessage = 'Failed to fetch news. Please try again later.';
        
        if (err.response) {
          // Handle specific HTTP error responses
          switch (err.response.status) {
            case 401:
            case 403:
              errorMessage = 'API key is invalid or expired. Please check your configuration.';
              break;
            case 429:
              errorMessage = 'Too many requests. Please try again later.';
              break;
            case 500:
              errorMessage = 'Server error. Please try again later.';
              break;
            default:
              errorMessage = `Error: ${err.response.status} - ${err.response.statusText}`;
          }
        } else if (err.request) {
          // Handle network errors
          errorMessage = 'Network error. Please check your internet connection.';
        } else if (err.message === 'API configuration error') {
          errorMessage = 'API key is missing. Please check the application configuration.';
        }
        
        setError(errorMessage);
        
        if (retryCount < 3 && err.response?.status !== 401 && err.response?.status !== 403) {
          const retryDelay = Math.pow(2, retryCount) * 1000;
          console.log(`Retrying in ${retryDelay/1000} seconds...`);
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, retryDelay);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [activeCategory, retryCount]);

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now.getTime() - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours} hours ago`;
    return format(timestamp, 'MMM d, yyyy');
  };

  const filteredNews = news.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="news-page">
      <div className="container">
        <h1>Market News</h1>
        
        <div className="news-controls">
          <div className="search-bar">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search news..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

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
        </div>

        {loading && (
          <div className="loading-state">
            <div className="loader"></div>
            <p>Loading latest news...</p>
          </div>
        )}

        {error && (
          <div className="error-state">
            <p>{error}</p>
            {retryCount < 3 && error !== 'API key is missing. Please check the application configuration.' && (
              <p>Retrying in {Math.pow(2, retryCount)} seconds...</p>
            )}
          </div>
        )}

        {!loading && !error && filteredNews.length === 0 && (
          <div className="no-results">
            <p>No news articles found matching your criteria.</p>
          </div>
        )}

        {!loading && !error && filteredNews.length > 0 && (
          <div className="news-grid">
            {filteredNews.map((article) => (
              <div key={article.id} className="news-card">
                <img 
                  src={article.image} 
                  alt={article.title} 
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x200';
                    e.target.onerror = null;
                  }} 
                />
                <div className="news-content">
                  <span className="news-category">{article.category}</span>
                  <h3>{article.title}</h3>
                  <p>{article.summary}</p>
                  <div className="news-meta">
                    <span className="source">
                      {article.source}
                    </span>
                    <span className="time">
                      <FiClock className="time-icon" />
                      {formatTimeAgo(article.datetime)}
                    </span>
                  </div>
                  <a 
                    href={article.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="read-more"
                  >
                    Read more <FiExternalLink />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default News; 