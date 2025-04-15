import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Chart from 'react-apexcharts';
import { auth } from '../firebase';
import TradeModal from '../components/TradeModal';
import { useTrade } from '../context/TradeContext';
import '../styles/Markets.css';

// Comprehensive list of Indian stocks for recommendations
const POPULAR_INDIAN_STOCKS = [
  { symbol: 'RELIANCE.NS', name: 'Reliance Industries Ltd', sector: 'Energy' },
  { symbol: 'TCS.NS', name: 'Tata Consultancy Services Ltd', sector: 'Technology' },
  { symbol: 'HDFCBANK.NS', name: 'HDFC Bank Ltd', sector: 'Financial Services' },
  { symbol: 'INFY.NS', name: 'Infosys Ltd', sector: 'Technology' },
  { symbol: 'ICICIBANK.NS', name: 'ICICI Bank Ltd', sector: 'Financial Services' },
  { symbol: 'SBIN.NS', name: 'State Bank of India', sector: 'Financial Services' },
  { symbol: 'TATASTEEL.NS', name: 'Tata Steel Ltd', sector: 'Materials' },
  { symbol: 'WIPRO.NS', name: 'Wipro Ltd', sector: 'Technology' },
  { symbol: 'BAJFINANCE.NS', name: 'Bajaj Finance Ltd', sector: 'Financial Services' },
  { symbol: 'MARUTI.NS', name: 'Maruti Suzuki India Ltd', sector: 'Automobile' },
  { symbol: 'HCLTECH.NS', name: 'HCL Technologies Ltd', sector: 'Technology' },
  { symbol: 'BHARTIARTL.NS', name: 'Bharti Airtel Ltd', sector: 'Telecom' },
  { symbol: 'ITC.NS', name: 'ITC Ltd', sector: 'Consumer Goods' },
  { symbol: 'BAJAJ-AUTO.NS', name: 'Bajaj Auto Ltd', sector: 'Automobile' },
  { symbol: 'SUNPHARMA.NS', name: 'Sun Pharmaceutical Industries Ltd', sector: 'Healthcare' },
  { symbol: 'AXISBANK.NS', name: 'Axis Bank Ltd', sector: 'Financial Services' },
  { symbol: 'ASIANPAINT.NS', name: 'Asian Paints Ltd', sector: 'Consumer Goods' },
  { symbol: 'KOTAKBANK.NS', name: 'Kotak Mahindra Bank Ltd', sector: 'Financial Services' },
  { symbol: 'TITAN.NS', name: 'Titan Company Ltd', sector: 'Consumer Goods' },
  { symbol: 'LT.NS', name: 'Larsen & Toubro Ltd', sector: 'Engineering' }
];

// Popular US stocks for recommendations
const POPULAR_US_STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', sector: 'Technology' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', sector: 'Consumer Discretionary' },
  { symbol: 'META', name: 'Meta Platforms Inc.', sector: 'Technology' },
  { symbol: 'TSLA', name: 'Tesla Inc.', sector: 'Automobile' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', sector: 'Technology' },
  { symbol: 'AMD', name: 'Advanced Micro Devices Inc.', sector: 'Technology' },
  { symbol: 'INTC', name: 'Intel Corporation', sector: 'Technology' },
  { symbol: 'IBM', name: 'International Business Machines', sector: 'Technology' }
];

// Popular Indices to recommend
const POPULAR_INDICES = [
  { symbol: '^NSEI', name: 'NIFTY 50', sector: 'Index' },
  { symbol: '^BSESN', name: 'S&P BSE SENSEX', sector: 'Index' },
  { symbol: '^DJI', name: 'Dow Jones Industrial Average', sector: 'Index' },
  { symbol: '^GSPC', name: 'S&P 500', sector: 'Index' },
  { symbol: '^IXIC', name: 'NASDAQ Composite', sector: 'Index' },
  { symbol: '^FTSE', name: 'FTSE 100', sector: 'Index' }
];

// Combine all stocks for the full dataset
const ALL_STOCKS = [...POPULAR_INDIAN_STOCKS, ...POPULAR_US_STOCKS, ...POPULAR_INDICES];

const Markets = () => {
  const navigate = useNavigate();
  const { handleTrade } = useTrade();
  const [stocks, setStocks] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [tradeType, setTradeType] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);
  const [recommendedStocks, setRecommendedStocks] = useState([]);
  const [searchFocused, setSearchFocused] = useState(false);
  
  const searchInputRef = useRef(null);

  const [chartOptions, setChartOptions] = useState({
    chart: {
      type: 'candlestick',
      height: 350,
      background: '#2a2a2a',
      foreColor: '#e0e0e0',
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true
        }
      },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350
        }
      }
    },
    plotOptions: {
      candlestick: {
        colors: {
          upward: '#00f962',
          downward: '#ff5a55'
        }
      }
    },
    xaxis: {
      type: 'datetime',
      labels: {
        style: {
          colors: '#e0e0e0'
        }
      }
    },
    yaxis: {
      tooltip: {
        enabled: true
      },
      labels: {
        style: {
          colors: '#e0e0e0'
        }
      }
    },
    grid: {
      borderColor: '#333'
    }
  });

  // Function to generate realistic candlestick data based on symbol characteristics
  const generateCandlestickData = (symbol, days = 30) => {
    // Use the symbol to generate a consistent but realistic price pattern
    const symbolHash = symbol
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Determine base price based on stock type (Indian, US, Index)
    let basePrice = 0;
    let volatility = 0;
    
    if (symbol.includes('.NS')) {
      // Indian stocks tend to be between ₹100 - ₹5000
      basePrice = 100 + (symbolHash % 4900);
      volatility = 0.015 + (symbolHash % 100) / 5000; // 1.5-3.5% volatility
    } else if (symbol.startsWith('^')) {
      // Indices
      if (symbol === '^NSEI') basePrice = 22500;
      else if (symbol === '^BSESN') basePrice = 74000;
      else if (symbol === '^DJI') basePrice = 39000;
      else if (symbol === '^GSPC') basePrice = 5200;
      else if (symbol === '^IXIC') basePrice = 16500;
      else if (symbol === '^FTSE') basePrice = 7800;
      else basePrice = 5000 + (symbolHash % 20000);
      
      volatility = 0.008 + (symbolHash % 50) / 10000; // 0.8-1.3% volatility for indices
    } else {
      // US stocks
      if (symbol === 'AAPL') basePrice = 170;
      else if (symbol === 'MSFT') basePrice = 420;
      else if (symbol === 'GOOGL') basePrice = 150;
      else if (symbol === 'AMZN') basePrice = 180;
      else if (symbol === 'TSLA') basePrice = 170;
      else basePrice = 50 + (symbolHash % 450);
      
      volatility = 0.02 + (symbolHash % 80) / 2000; // 2-6% volatility
    }
    
    // Generate data
    const data = [];
    let currentPrice = basePrice;
    const today = new Date();
    
    // Create a trend pattern based on the symbol
    const trendDirection = (symbolHash % 3) - 1; // -1 (down), 0 (sideways), 1 (up)
    const trendStrength = (symbolHash % 10) / 1000; // 0-0.01 daily trend
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      
      // Add some cyclical patterns
      const cyclicalPattern = Math.sin(i / 5) * (volatility / 2);
      
      // Generate random movement with trend bias
      const dailyTrend = trendDirection * trendStrength;
      const randomFactor = (Math.random() - 0.5) * volatility;
      const dayChange = randomFactor + dailyTrend + cyclicalPattern;
      
      // Generate open, high, low, close
      const open = currentPrice;
      const close = open * (1 + dayChange);
      const maxMove = Math.abs(open - close) + (open * volatility * 0.5);
      const high = Math.max(open, close) + (Math.random() * maxMove);
      const low = Math.min(open, close) - (Math.random() * maxMove);
      
      data.push({
        x: date.getTime(),
        y: [
          parseFloat(open.toFixed(2)),
          parseFloat(high.toFixed(2)),
          parseFloat(low.toFixed(2)),
          parseFloat(close.toFixed(2))
        ]
      });
      
      currentPrice = close;
    }
    
    return data;
  };

  // Load initial recommendations
  useEffect(() => {
    // Show a mix of US and Indian stocks as recommendations
    const recommended = [
      ...POPULAR_INDIAN_STOCKS.slice(0, 3),
      ...POPULAR_US_STOCKS.slice(0, 3),
      ...POPULAR_INDICES.slice(0, 2)
    ];
    setRecommendedStocks(recommended);
  }, []);

  // Handle search input
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.length > 0) {
      // Search across all available stocks
      const filtered = ALL_STOCKS.filter(stock => 
        stock.symbol.toLowerCase().includes(value.toLowerCase()) ||
        stock.name.toLowerCase().includes(value.toLowerCase()) ||
        stock.sector.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      // Show recent searches or popular stocks when search is empty
      setSuggestions(recentSearches.length > 0 ? recentSearches : recommendedStocks);
    }
  };

  // Handle search input focus
  const handleSearchFocus = () => {
    setSearchFocused(true);
    // Show recent searches or recommendations
    if (searchTerm.length === 0) {
      setSuggestions(recentSearches.length > 0 ? recentSearches : recommendedStocks);
    }
  };

  // Handle click outside search
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target)) {
        setSearchFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle stock selection
  const handleStockSelect = (stock) => {
    setIsLoading(true);
    setSearchTerm('');
    setSuggestions([]);
    setSearchFocused(false);
    
    // Add to recent searches if not already present
    if (!recentSearches.some(s => s.symbol === stock.symbol)) {
      const updatedRecent = [stock, ...recentSearches.slice(0, 4)]; // Keep only 5 recent searches
      setRecentSearches(updatedRecent);
    }

    // Simulate API call to fetch stock data
    setTimeout(() => {
      try {
        // Generate mock data for selected stock
        const candlestickData = generateCandlestickData(stock.symbol, 30);
        
        // Calculate current price and changes
        const lastDay = candlestickData[candlestickData.length - 1];
        const prevDay = candlestickData[candlestickData.length - 2];
        
        const stockData = {
          ...stock,
          data: candlestickData,
          currentPrice: lastDay.y[3],
          change: lastDay.y[3] - prevDay.y[3],
          changePercent: ((lastDay.y[3] - prevDay.y[3]) / prevDay.y[3]) * 100,
          volume: ((Math.random() * 5) + 1).toFixed(2) + 'M',
          high: Math.max(...candlestickData.map(d => d.y[1])),
          low: Math.min(...candlestickData.map(d => d.y[2])),
          open: candlestickData[0].y[0],
          marketCap: stock.symbol.includes('.NS') ? '₹' + ((Math.random() * 500) + 50).toFixed(2) + 'B' 
                  : stock.symbol.startsWith('^') ? 'N/A' 
                  : '$' + ((Math.random() * 2000) + 100).toFixed(2) + 'B'
        };

        setSelectedStock(stockData);
      } catch (error) {
        console.error("Error generating stock data:", error);
        // If error, still show basic info
        setSelectedStock({
          ...stock,
          data: [],
          currentPrice: 0,
          change: 0,
          changePercent: 0
        });
      } finally {
        setIsLoading(false);
      }
    }, 800);
  };

  const processTradeRequest = (tradeDetails) => {
    if (!auth.currentUser) {
      navigate('/login');
      return;
    }

    // Use the TradeContext's handleTrade function
    handleTrade({
      ...tradeDetails,
      shares: tradeDetails.quantity,
      type: tradeDetails.type
    });
    
    // Close modal after trade
    setIsTradeModalOpen(false);
  };

  const formatCurrency = (price, symbol) => {
    if (symbol && symbol.includes('.NS')) {
      return '₹' + price.toFixed(2);
    } else if (symbol && symbol.startsWith('^')) {
      return price.toFixed(2); // Indices just show the value
    } else {
      return '$' + price.toFixed(2);
    }
  };

  return (
    <div className="markets-page">
      <div className="container">
        <h1>Stock Market Explorer</h1>
        
        <div className="search-container" ref={searchInputRef}>
          <div className="search-input-wrapper">
            <i className="search-icon fas fa-search"></i>
            <input
              type="text"
              placeholder="Search stocks, indices, sectors..."
              value={searchTerm}
              onChange={handleSearch}
              onFocus={handleSearchFocus}
              className="search-input"
            />
            {searchTerm && (
              <button className="clear-search" onClick={() => setSearchTerm('')}>
                ×
              </button>
            )}
          </div>
          
          {searchFocused && (suggestions.length > 0 || searchTerm.length === 0) && (
            <div className="suggestions-panel">
              <div className="suggestions-header">
                {searchTerm.length === 0 && recentSearches.length > 0 ? 'Recent Searches' : 
                 searchTerm.length === 0 ? 'Recommended Stocks' : 'Search Results'}
              </div>
              
              <div className="suggestions-list">
                {suggestions.map((stock, index) => (
                  <div
                    key={index}
                    className="suggestion-item"
                    onClick={() => handleStockSelect(stock)}
                  >
                    <div className="suggestion-main">
                      <span className="suggestion-symbol">{stock.symbol}</span>
                      <span className="suggestion-name">{stock.name}</span>
                    </div>
                    <span className="suggestion-sector">{stock.sector}</span>
                  </div>
                ))}
                
                {suggestions.length === 0 && searchTerm.length > 0 && (
                  <div className="no-results">
                    No results found for "{searchTerm}"
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {isLoading && (
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>Loading stock data...</p>
          </div>
        )}

        {/* Render Recommended Stocks if nothing is selected */}
        {!selectedStock && !isLoading && (
          <div className="market-categories">
            <div className="category">
              <h2>Popular Indian Stocks</h2>
              <div className="stock-grid">
                {POPULAR_INDIAN_STOCKS.slice(0, 8).map((stock, index) => (
                  <div 
                    key={index} 
                    className="stock-card"
                    onClick={() => handleStockSelect(stock)}
                  >
                    <div className="stock-card-symbol">{stock.symbol.replace('.NS', '')}</div>
                    <div className="stock-card-name">{stock.name}</div>
                    <div className="stock-card-sector">{stock.sector}</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="category">
              <h2>Popular US Stocks</h2>
              <div className="stock-grid">
                {POPULAR_US_STOCKS.slice(0, 8).map((stock, index) => (
                  <div 
                    key={index} 
                    className="stock-card"
                    onClick={() => handleStockSelect(stock)}
                  >
                    <div className="stock-card-symbol">{stock.symbol}</div>
                    <div className="stock-card-name">{stock.name}</div>
                    <div className="stock-card-sector">{stock.sector}</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="category">
              <h2>Major Indices</h2>
              <div className="stock-grid">
                {POPULAR_INDICES.map((index_, i) => (
                  <div 
                    key={i} 
                    className="stock-card index-card"
                    onClick={() => handleStockSelect(index_)}
                  >
                    <div className="stock-card-symbol">{index_.symbol}</div>
                    <div className="stock-card-name">{index_.name}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedStock && !isLoading && (
          <div className="selected-stock">
            <div className="stock-info">
              <div className="stock-header">
                <div className="stock-title">
                  <div className="stock-symbol">{selectedStock.symbol}</div>
                  <div className="stock-name">{selectedStock.name}</div>
                </div>
                <div className="stock-actions">
                  <button
                    className="trade-btn buy"
                    onClick={() => {
                      setTradeType('buy');
                      setIsTradeModalOpen(true);
                    }}
                  >
                    Buy
                  </button>
                  <button
                    className="trade-btn sell"
                    onClick={() => {
                      setTradeType('sell');
                      setIsTradeModalOpen(true);
                    }}
                  >
                    Sell
                  </button>
                </div>
              </div>

              <div className="stock-price-container">
                <div className="current-price">
                  {formatCurrency(selectedStock.currentPrice, selectedStock.symbol)}
                </div>
                <div className={`price-change ${selectedStock.change >= 0 ? 'positive' : 'negative'}`}>
                  {selectedStock.change >= 0 ? '+' : ''}{formatCurrency(selectedStock.change, selectedStock.symbol)} 
                  ({selectedStock.change >= 0 ? '+' : ''}{selectedStock.changePercent.toFixed(2)}%)
                </div>
              </div>

              <div className="stock-chart">
                <Chart
                  options={chartOptions}
                  series={[{ data: selectedStock.data }]}
                  type="candlestick"
                  height={400}
                />
              </div>

              <div className="stock-details">
                <div className="detail-item">
                  <span className="detail-label">Open</span>
                  <span className="detail-value">{formatCurrency(selectedStock.open, selectedStock.symbol)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">High</span>
                  <span className="detail-value">{formatCurrency(selectedStock.high, selectedStock.symbol)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Low</span>
                  <span className="detail-value">{formatCurrency(selectedStock.low, selectedStock.symbol)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Volume</span>
                  <span className="detail-value">{selectedStock.volume}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Market Cap</span>
                  <span className="detail-value">{selectedStock.marketCap}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Sector</span>
                  <span className="detail-value">{selectedStock.sector}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {isTradeModalOpen && selectedStock && (
          <TradeModal
            stock={{
              symbol: selectedStock.symbol,
              name: selectedStock.name,
              price: selectedStock.currentPrice
            }}
            type={tradeType}
            onClose={() => setIsTradeModalOpen(false)}
            onSubmit={processTradeRequest}
          />
        )}
      </div>
    </div>
  );
};

export default Markets; 