import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import '../styles/Markets.css';

const Markets = () => {
  const [stocks, setStocks] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

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

  // Available stocks database
  const availableStocks = [
    { symbol: 'AAPL', name: 'Apple Inc.', basePrice: 170, volatility: 0.02 },
    { symbol: 'MSFT', name: 'Microsoft', basePrice: 420, volatility: 0.015 },
    { symbol: 'GOOGL', name: 'Alphabet', basePrice: 150, volatility: 0.018 },
    { symbol: 'AMZN', name: 'Amazon', basePrice: 180, volatility: 0.025 },
    { symbol: 'META', name: 'Meta', basePrice: 500, volatility: 0.022 },
    { symbol: 'TSLA', name: 'Tesla', basePrice: 170, volatility: 0.03 },
    { symbol: 'NVDA', name: 'NVIDIA', basePrice: 900, volatility: 0.04 },
    { symbol: 'AMD', name: 'Advanced Micro Devices', basePrice: 180, volatility: 0.035 },
    { symbol: 'INTC', name: 'Intel', basePrice: 45, volatility: 0.025 },
    { symbol: 'IBM', name: 'IBM', basePrice: 190, volatility: 0.015 }
  ];

  // Function to generate realistic candlestick data
  const generateCandlestickData = (basePrice, volatility, days) => {
    const data = [];
    let currentPrice = basePrice;
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Generate random price movement with more realistic patterns
      const open = currentPrice;
      const change = (Math.random() - 0.5) * volatility;
      const close = open * (1 + change);
      const high = Math.max(open, close) * (1 + Math.random() * 0.005);
      const low = Math.min(open, close) * (1 - Math.random() * 0.005);
      
      data.push({
        x: date.getTime(),
        y: [open, high, low, close].map(price => Math.round(price * 100) / 100)
      });
      
      currentPrice = close;
    }
    
    return data;
  };

  // Handle search input
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.length > 0) {
      const filtered = availableStocks.filter(stock => 
        stock.symbol.toLowerCase().includes(value.toLowerCase()) ||
        stock.name.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  // Handle stock selection
  const handleStockSelect = (stock) => {
    setIsLoading(true);
    setSearchTerm('');
    setSuggestions([]);
    
    // Simulate API call delay
    setTimeout(() => {
      const stockData = {
        ...stock,
        data: generateCandlestickData(stock.basePrice, stock.volatility, 30),
        currentPrice: 0,
        change: 0,
        changePercent: 0
      };

      // Calculate current price and changes
      const lastDay = stockData.data[stockData.data.length - 1];
      const prevDay = stockData.data[stockData.data.length - 2];
      stockData.currentPrice = lastDay.y[3];
      stockData.change = lastDay.y[3] - prevDay.y[3];
      stockData.changePercent = (stockData.change / prevDay.y[3]) * 100;

      setSelectedStock(stockData);
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="markets-page">
      <div className="container">
        <h1>Stock Market Overview</h1>
        
        <div className="search-container">
          <input
            type="text"
            placeholder="Search for a stock (e.g., AAPL, Microsoft)"
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
          {suggestions.length > 0 && (
            <div className="suggestions">
              {suggestions.map((stock, index) => (
                <div
                  key={index}
                  className="suggestion-item"
                  onClick={() => handleStockSelect(stock)}
                >
                  <span className="suggestion-symbol">{stock.symbol}</span>
                  <span className="suggestion-name">{stock.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {isLoading && (
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>Loading stock data...</p>
          </div>
        )}

        {selectedStock && !isLoading && (
          <div className="selected-stock">
            <div className="stock-info">
              <div className="stock-symbol">{selectedStock.symbol}</div>
              <div className="stock-name">{selectedStock.name}</div>
              <div className="stock-price">${selectedStock.currentPrice.toFixed(2)}</div>
              <div className={`stock-change ${selectedStock.change >= 0 ? 'positive' : 'negative'}`}>
                {selectedStock.change >= 0 ? '▲' : '▼'} ${Math.abs(selectedStock.change).toFixed(2)} ({selectedStock.changePercent.toFixed(2)}%)
              </div>
            </div>
            <div className="chart-container">
              <Chart
                options={{
                  ...chartOptions,
                  title: {
                    text: `${selectedStock.symbol} - Last 30 Days`,
                    align: 'left',
                    style: {
                      color: '#e0e0e0'
                    }
                  }
                }}
                series={[{
                  data: selectedStock.data
                }]}
                type="candlestick"
                height={400}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Markets; 