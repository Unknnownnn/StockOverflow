import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/MarketOverview.css';
import { fetchMarketData as fetchYahooQuotes, fetchHistoricalData, fetchTopGainers, fetchTopLosers, fetchIndianIndices, getMockIndianIndices, getMockTopMovers } from '../services/yahooFinanceAPI';

const MarketOverview = () => {
  const navigate = useNavigate();
  const [niftyData, setNiftyData] = useState([]);
  const [sensexData, setSensexData] = useState([]);
  const [currentPrices, setCurrentPrices] = useState({
    nifty: { price: 0, change: 0, changePercent: 0 },
    sensex: { price: 0, change: 0, changePercent: 0 }
  });
  const [topGainers, setTopGainers] = useState([]);
  const [topLosers, setTopLosers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  
  // Function to fetch market data from Alpha Vantage API
  const fetchMarketData = async (symbol) => {
    try {
      console.log(`Fetching data for ${symbol}...`);
      
      // Use Alpha Vantage API symbol format (without ^ prefix)
      const alphaVantageSymbol = symbol.replace('^', '');
      
      // Use the real API instead of mock data
      const response = await fetchHistoricalData(alphaVantageSymbol);
      
      if (response && response.formattedData && response.formattedData.length > 0) {
        console.log(`Successfully fetched historical data for ${symbol}`);
        return response.formattedData;
      } else {
        console.log('No data found, falling back to mock data');
        return generateHistoricalMockData(symbol);
      }
    } catch (error) {
      console.error(`Error fetching data for ${symbol}:`, error);
      console.log('API call failed, falling back to mock data');
      return generateHistoricalMockData(symbol);
    }
  };

  // Generate realistic historical mock data as fallback
  const generateHistoricalMockData = (symbol) => {
    console.log(`Generating historical mock data for ${symbol}...`);
    
    // Existing mock data generation code remains as fallback
    const basePrice = symbol === "^NSEI" ? 22500 : 74000;
    const today = new Date();
    const data = [];
    
    // Generate 30 days of data
    for (let i = 30; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      
      // Create some trending patterns
      const trendFactor = Math.sin(i / 10) * 0.005; // Creates a wave pattern
      const dailyRandomFactor = 0.01; // 1% random daily variation
      
      // Each day is influenced by the previous day plus some randomness and trend
      let prevClose = i < 30 ? data[data.length - 1]?.y[3] : basePrice;
      if (!prevClose) prevClose = basePrice;
      
      const open = prevClose * (1 + (Math.random() - 0.5) * dailyRandomFactor + trendFactor);
      const high = open * (1 + Math.random() * 0.005); // Up to 0.5% higher than open
      const low = open * (1 - Math.random() * 0.005); // Up to 0.5% lower than open
      const close = (open + high + low) / 3 + (Math.random() - 0.5) * basePrice * 0.002;
      
      data.push({
        x: date,
        y: [open, high, low, close]
      });
    }
    
    updateCurrentPricesFromHistoricalData(symbol, data);
    
    return data;
  };
  
  // Helper function to update current prices from historical data
  const updateCurrentPricesFromHistoricalData = (symbol, data) => {
    if (data.length >= 2) {
      const lastItem = data[data.length - 1];
      const secondLastItem = data[data.length - 2];
      
      const currentPrice = lastItem.y[3];
      const previousPrice = secondLastItem.y[3];
      const priceChange = currentPrice - previousPrice;
      const priceChangePercent = (priceChange / previousPrice) * 100;
      
      if (symbol === "^NSEI" || symbol === "NSEI") {
        setCurrentPrices(prev => ({
          ...prev,
          nifty: {
            price: currentPrice,
            change: priceChange,
            changePercent: priceChangePercent
          }
        }));
      } else if (symbol === "^BSESN" || symbol === "BSESN") {
        setCurrentPrices(prev => ({
          ...prev,
          sensex: {
            price: currentPrice,
            change: priceChange,
            changePercent: priceChangePercent
          }
        }));
      }
    }
  };

  // Function to fetch top gainers and losers
  const fetchTopMovers = async () => {
    try {
      console.log('Fetching top gainers and losers...');
      
      // Use the real API instead of mock data
      const [gainersResponse, losersResponse] = await Promise.all([
        fetchTopGainers(),
        fetchTopLosers()
      ]);
      
      if (gainersResponse && gainersResponse.length > 0 && losersResponse && losersResponse.length > 0) {
        // Transform the API response to the format expected by the UI
        const transformedGainers = gainersResponse.map(stock => ({
          symbol: stock.symbol.replace('.NS', ''),
          name: stock.shortName || stock.symbol,
          price: stock.regularMarketPrice.toFixed(2),
          change: `${stock.regularMarketChangePercent >= 0 ? '+' : ''}${stock.regularMarketChangePercent.toFixed(2)}%`,
          changeValue: stock.regularMarketChange,
          changePercent: stock.regularMarketChangePercent,
          volume: `${(stock.regularMarketVolume / 1000000).toFixed(1)}M`
        }));
        
        const transformedLosers = losersResponse.map(stock => ({
          symbol: stock.symbol.replace('.NS', ''),
          name: stock.shortName || stock.symbol,
          price: stock.regularMarketPrice.toFixed(2),
          change: `${stock.regularMarketChangePercent >= 0 ? '+' : ''}${stock.regularMarketChangePercent.toFixed(2)}%`,
          changeValue: stock.regularMarketChange,
          changePercent: stock.regularMarketChangePercent,
          volume: `${(stock.regularMarketVolume / 1000000).toFixed(1)}M`
        }));
        
        setTopGainers(transformedGainers);
        setTopLosers(transformedLosers);
      } else {
        console.log('No data found, falling back to mock data');
        const mockData = getMockTopMovers();
        
        // Transform mock data to UI format
        const transformedGainers = mockData.gainers.map(stock => ({
          symbol: stock.symbol.replace('.NS', ''),
          name: stock.name,
          price: stock.regularMarketPrice,
          change: `${parseFloat(stock.regularMarketChangePercent) >= 0 ? '+' : ''}${stock.regularMarketChangePercent}%`,
          changeValue: parseFloat(stock.regularMarketChange),
          changePercent: parseFloat(stock.regularMarketChangePercent),
          volume: `${(Math.random() * 20 + 1).toFixed(1)}M`
        }));
        
        const transformedLosers = mockData.losers.map(stock => ({
          symbol: stock.symbol.replace('.NS', ''),
          name: stock.name,
          price: stock.regularMarketPrice,
          change: `${parseFloat(stock.regularMarketChangePercent) >= 0 ? '+' : ''}${stock.regularMarketChangePercent}%`,
          changeValue: parseFloat(stock.regularMarketChange),
          changePercent: parseFloat(stock.regularMarketChangePercent),
          volume: `${(Math.random() * 20 + 1).toFixed(1)}M`
        }));
        
        setTopGainers(transformedGainers);
        setTopLosers(transformedLosers);
      }
    } catch (error) {
      console.error('Error fetching top movers:', error);
      // Fallback to mock data in case of error
      const mockData = getMockTopMovers();
      
      // Transform mock data to UI format
      const transformedGainers = mockData.gainers.map(stock => ({
        symbol: stock.symbol.replace('.NS', ''),
        name: stock.name,
        price: stock.regularMarketPrice,
        change: `${parseFloat(stock.regularMarketChangePercent) >= 0 ? '+' : ''}${stock.regularMarketChangePercent}%`,
        changeValue: parseFloat(stock.regularMarketChange),
        changePercent: parseFloat(stock.regularMarketChangePercent),
        volume: `${(Math.random() * 20 + 1).toFixed(1)}M`
      }));
      
      const transformedLosers = mockData.losers.map(stock => ({
        symbol: stock.symbol.replace('.NS', ''),
        name: stock.name,
        price: stock.regularMarketPrice,
        change: `${parseFloat(stock.regularMarketChangePercent) >= 0 ? '+' : ''}${stock.regularMarketChangePercent}%`,
        changeValue: parseFloat(stock.regularMarketChange),
        changePercent: parseFloat(stock.regularMarketChangePercent),
        volume: `${(Math.random() * 20 + 1).toFixed(1)}M`
      }));
      
      setTopGainers(transformedGainers);
      setTopLosers(transformedLosers);
    }
  };

  // Update current prices from real API
  const fetchCurrentPrices = async () => {
    try {
      console.log('Fetching current prices for indices...');
      const indicesData = await fetchIndianIndices();
      
      if (indicesData && indicesData.nifty && indicesData.sensex) {
        console.log('Successfully fetched current prices for indices', indicesData);
        setCurrentPrices({
          nifty: {
            price: indicesData.nifty.regularMarketPrice,
            change: indicesData.nifty.regularMarketChange,
            changePercent: indicesData.nifty.regularMarketChangePercent
          },
          sensex: {
            price: indicesData.sensex.regularMarketPrice,
            change: indicesData.sensex.regularMarketChange,
            changePercent: indicesData.sensex.regularMarketChangePercent
          }
        });
      } else {
        console.log('No indices data found, falling back to mock data');
        const mockIndices = getMockIndianIndices();
        
        setCurrentPrices({
          nifty: {
            price: parseFloat(mockIndices.nifty.regularMarketPrice),
            change: parseFloat(mockIndices.nifty.regularMarketChange),
            changePercent: parseFloat(mockIndices.nifty.regularMarketChangePercent)
          },
          sensex: {
            price: parseFloat(mockIndices.sensex.regularMarketPrice),
            change: parseFloat(mockIndices.sensex.regularMarketChange),
            changePercent: parseFloat(mockIndices.sensex.regularMarketChangePercent)
          }
        });
      }
    } catch (error) {
      console.error('Error fetching current prices:', error);
      // Fallback to mock data
      const mockIndices = getMockIndianIndices();
      
      setCurrentPrices({
        nifty: {
          price: parseFloat(mockIndices.nifty.regularMarketPrice),
          change: parseFloat(mockIndices.nifty.regularMarketChange),
          changePercent: parseFloat(mockIndices.nifty.regularMarketChangePercent)
        },
        sensex: {
          price: parseFloat(mockIndices.sensex.regularMarketPrice),
          change: parseFloat(mockIndices.sensex.regularMarketChange),
          changePercent: parseFloat(mockIndices.sensex.regularMarketChangePercent)
        }
      });
    }
  };

  const updateMarketData = async () => {
    setLoading(true);
    try {
      // Fetch current prices for indices first
      await fetchCurrentPrices();
      
      // Fetch historical data for charts
      const niftyNewData = await fetchMarketData("^NSEI"); // NIFTY 50 symbol
      const sensexNewData = await fetchMarketData("^BSESN"); // SENSEX symbol
      
      if (niftyNewData.length > 0) setNiftyData(niftyNewData);
      if (sensexNewData.length > 0) setSensexData(sensexNewData);
      
      // Fetch top gainers and losers
      await fetchTopMovers();
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error updating market data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    updateMarketData();
    // Update data every 5 minutes
    const interval = setInterval(updateMarketData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Handle "See More" clicks to navigate to Markets page
  const handleSeeMoreClick = () => {
    navigate('/markets');
  };

  const chartOptions = {
    chart: {
      type: 'candlestick',
      height: 350,
      background: 'transparent',
      theme: {
        mode: 'dark'
      },
      toolbar: {
        show: true,
        tools: {
          download: false,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true
        }
      }
    },
    title: {
      align: 'left',
      style: {
        color: '#e0e0e0'
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
      labels: {
        style: {
          colors: '#e0e0e0'
        },
        formatter: (value) => value.toFixed(2)
      },
      tooltip: {
        enabled: true
      }
    },
    grid: {
      borderColor: '#333',
      strokeDashArray: 5
    },
    plotOptions: {
      candlestick: {
        colors: {
          upward: '#00f962',
          downward: '#ff5a55'
        },
        wick: {
          useFillColor: true
        }
      }
    }
  };

  const niftySeries = [{
    data: niftyData
  }];

  const sensexSeries = [{
    data: sensexData
  }];

  if (loading && niftyData.length === 0 && sensexData.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="market-overview">
      <div className="market-ticker-strip">
        <div className="ticker-item">
          <span className="ticker-symbol">USD/INR</span>
          <span className="ticker-price">82.95</span>
          <span className="change negative">-0.15%</span>
        </div>
        <div className="ticker-item">
          <span className="ticker-symbol">GOLD</span>
          <span className="ticker-price">₹62,450</span>
          <span className="change positive">+0.32%</span>
        </div>
        <div className="ticker-item">
          <span className="ticker-symbol">CRUDE OIL</span>
          <span className="ticker-price">$75.25</span>
          <span className="change positive">+1.25%</span>
        </div>
      </div>

      <div className="main-indices">
        <div className="index-card nifty">
          <div className="index-header">
            <h2>NIFTY 50</h2>
            <span className="index-time">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          </div>
          <div className="index-details">
            <div className="price-container">
              <div className="price">{currentPrices.nifty.price.toFixed(2)}</div>
              <div className="change-container">
                <div className={`change ${currentPrices.nifty.change >= 0 ? 'positive' : 'negative'}`}>
                  {currentPrices.nifty.change >= 0 ? '+' : ''}{currentPrices.nifty.change.toFixed(2)}
                </div>
                <div className={`change-percent ${currentPrices.nifty.changePercent >= 0 ? 'positive' : 'negative'}`}>
                  ({currentPrices.nifty.changePercent >= 0 ? '+' : ''}{currentPrices.nifty.changePercent.toFixed(2)}%)
                </div>
              </div>
            </div>
            <div className="chart-preview">
              <ReactApexChart
                options={{
                  ...chartOptions,
                  title: { ...chartOptions.title, text: 'NIFTY 50' }
                }}
                series={niftySeries}
                type="candlestick"
                height={350}
              />
            </div>
          </div>
        </div>

        <div className="index-card sensex">
          <div className="index-header">
            <h2>SENSEX</h2>
            <span className="index-time">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          </div>
          <div className="index-details">
            <div className="price-container">
              <div className="price">{currentPrices.sensex.price.toFixed(2)}</div>
              <div className="change-container">
                <div className={`change ${currentPrices.sensex.change >= 0 ? 'positive' : 'negative'}`}>
                  {currentPrices.sensex.change >= 0 ? '+' : ''}{currentPrices.sensex.change.toFixed(2)}
                </div>
                <div className={`change-percent ${currentPrices.sensex.changePercent >= 0 ? 'positive' : 'negative'}`}>
                  ({currentPrices.sensex.changePercent >= 0 ? '+' : ''}{currentPrices.sensex.changePercent.toFixed(2)}%)
                </div>
              </div>
            </div>
            <div className="chart-preview">
              <ReactApexChart
                options={{
                  ...chartOptions,
                  title: { ...chartOptions.title, text: 'SENSEX' }
                }}
                series={sensexSeries}
                type="candlestick"
                height={350}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="market-movers-section">
        <div className="section-header">
          <h2>Market Movers</h2>
          <div className="market-action">
          <div className="market-status">
            <span className="status-indicator active"></span>
            Market Open
            </div>
            <button className="see-more-btn" onClick={handleSeeMoreClick}>
              Explore More Stocks
            </button>
          </div>
        </div>
        
        <div className="movers-container">
          <div className="movers-card gainers">
            <div className="card-header">
              <h3>Top Gainers</h3>
              <span className="subtitle">NSE</span>
            </div>
            <div className="movers-list">
              <div className="list-header">
                <span>Symbol</span>
                <span>Price</span>
                <span>Change</span>
                <span>Volume</span>
              </div>
              {topGainers.map((stock, index) => (
                <div key={index} className="mover-item">
                  <span className="symbol">{stock.symbol}</span>
                  <span className="price">₹{stock.price}</span>
                  <span className="change positive">{stock.change}</span>
                  <span className="volume">{stock.volume}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="movers-card losers">
            <div className="card-header">
              <h3>Top Losers</h3>
              <span className="subtitle">NSE</span>
            </div>
            <div className="movers-list">
              <div className="list-header">
                <span>Symbol</span>
                <span>Price</span>
                <span>Change</span>
                <span>Volume</span>
              </div>
              {topLosers.map((stock, index) => (
                <div key={index} className="mover-item">
                  <span className="symbol">{stock.symbol}</span>
                  <span className="price">₹{stock.price}</span>
                  <span className="change negative">{stock.change}</span>
                  <span className="volume">{stock.volume}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketOverview; 