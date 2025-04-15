import axios from 'axios';

// Alpha Vantage API endpoints
const ALPHA_VANTAGE_API_URL = 'https://www.alphavantage.co/query';
const ALPHA_VANTAGE_API_KEY = 'T2DYDO9QED5R04N4'; // Replace with your Alpha Vantage API key

/**
 * Fetch quote summary for a specific symbol 
 * @param {string} symbol - Stock symbol
 * @returns {Promise} - Promise with quote summary data
 */
export const fetchQuoteSummary = async (symbol) => {
  try {
    const response = await axios.get(ALPHA_VANTAGE_API_URL, {
      params: {
        function: 'OVERVIEW',
        symbol,
        apikey: ALPHA_VANTAGE_API_KEY
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching quote summary:', error);
    throw error;
  }
};

/**
 * Fetch market data for a specific symbol
 * @param {string} symbol - Stock symbol
 * @returns {Promise} - Promise with stock data
 */
export const fetchMarketData = async (symbol) => {
  try {
    const response = await axios.get(ALPHA_VANTAGE_API_URL, {
      params: {
        function: 'GLOBAL_QUOTE',
        symbol,
        apikey: ALPHA_VANTAGE_API_KEY
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching market data:', error);
    throw error;
  }
};

/**
 * Fetch historical data for a specific symbol
 * @param {string} symbol - Stock symbol
 * @param {string} interval - Time interval (daily, weekly, monthly)
 * @param {string} outputsize - Compact or full
 * @returns {Promise} - Promise with historical stock data
 */
export const fetchHistoricalData = async (symbol, interval = 'daily', outputsize = 'compact') => {
  try {
    // Convert interval to Alpha Vantage format
    const timeSeriesFunction = 
      interval === 'daily' ? 'TIME_SERIES_DAILY' : 
      interval === 'weekly' ? 'TIME_SERIES_WEEKLY' : 'TIME_SERIES_MONTHLY';
    
    const response = await axios.get(ALPHA_VANTAGE_API_URL, {
      params: {
        function: timeSeriesFunction,
        symbol,
        outputsize,
        apikey: ALPHA_VANTAGE_API_KEY
      }
    });
    
    // Process response for ApexCharts format
    const timeSeriesKey = 
      interval === 'daily' ? 'Time Series (Daily)' : 
      interval === 'weekly' ? 'Weekly Time Series' : 'Monthly Time Series';
    
    if (response.data && response.data[timeSeriesKey]) {
      const formattedData = Object.entries(response.data[timeSeriesKey]).map(([date, data]) => ({
        x: new Date(date).getTime(),
        y: [
          parseFloat(data['1. open']),
          parseFloat(data['2. high']),
          parseFloat(data['3. low']),
          parseFloat(data['4. close'])
        ]
      }));
      
      // Sort by date
      formattedData.sort((a, b) => a.x - b.x);
      
      return {
        items: response.data[timeSeriesKey],
        formattedData
      };
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching historical data:', error);
    throw error;
  }
};

/**
 * Fetch top gainers and losers from the market
 * @returns {Promise} - Promise with top gainers and losers data
 */
export const fetchTopGainers = async () => {
  try {
    // Alpha Vantage doesn't have a direct API for top gainers
    // so we'll return a mock response for now
    console.warn('Alpha Vantage doesn\'t have a direct API for top gainers, returning mock data');
    return getMockTopMovers().gainers;
  } catch (error) {
    console.error('Error fetching top gainers:', error);
    throw error;
  }
};

/**
 * Fetch top losers from the market
 * @returns {Promise} - Promise with top losers data
 */
export const fetchTopLosers = async () => {
  try {
    // Alpha Vantage doesn't have a direct API for top losers
    // so we'll return a mock response for now
    console.warn('Alpha Vantage doesn\'t have a direct API for top losers, returning mock data');
    return getMockTopMovers().losers;
  } catch (error) {
    console.error('Error fetching top losers:', error);
    throw error;
  }
};

/**
 * Fetch data for specific Indian indices (Nifty 50 and Sensex)
 * @returns {Promise} - Promise with indices data
 */
export const fetchIndianIndices = async () => {
  try {
    // Alpha Vantage uses different symbols for Indian indices
    // For Nifty 50: ^NSEI or NSEI
    // For Sensex: ^BSESN or BSESN
    const niftySymbol = 'NSEI';  // Alpha Vantage uses NSEI without ^ for Nifty 50
    const sensexSymbol = 'BSESN'; // Alpha Vantage uses BSESN without ^ for Sensex
    
    // Get the latest quotes for both indices
    const [niftyRes, sensexRes] = await Promise.all([
      axios.get(ALPHA_VANTAGE_API_URL, {
        params: {
          function: 'GLOBAL_QUOTE',
          symbol: niftySymbol,
          apikey: ALPHA_VANTAGE_API_KEY
        }
      }),
      axios.get(ALPHA_VANTAGE_API_URL, {
        params: {
          function: 'GLOBAL_QUOTE',
          symbol: sensexSymbol,
          apikey: ALPHA_VANTAGE_API_KEY
        }
      })
    ]);
    
    // Check if we got valid data
    const niftyData = niftyRes.data['Global Quote'];
    const sensexData = sensexRes.data['Global Quote'];
    
    if (niftyData && sensexData) {
      return {
        nifty: {
          regularMarketPrice: parseFloat(niftyData['05. price']),
          regularMarketChange: parseFloat(niftyData['09. change']),
          regularMarketChangePercent: parseFloat(niftyData['10. change percent'].replace('%', ''))
        },
        sensex: {
          regularMarketPrice: parseFloat(sensexData['05. price']),
          regularMarketChange: parseFloat(sensexData['09. change']),
          regularMarketChangePercent: parseFloat(sensexData['10. change percent'].replace('%', ''))
        }
      };
    }
    
    console.warn('No valid indices data from Alpha Vantage, falling back to mock data');
    return getMockIndianIndices();
  } catch (error) {
    console.error('Error fetching Indian indices:', error);
    return getMockIndianIndices();
  }
};

// Fallback functions that return mock data if API fails or during development
export const getMockIndianIndices = () => {
  const generateRandomPrice = (base) => {
    return (base + (Math.random() * 100 - 50)).toFixed(2);
  };
  
  const generateRandomChange = () => {
    return (Math.random() * 2 - 1).toFixed(2);
  };

  const niftyPrice = generateRandomPrice(22000);
  const sensexPrice = generateRandomPrice(72000);
  const niftyChange = generateRandomChange();
  const sensexChange = generateRandomChange();

  return {
    nifty: {
      regularMarketPrice: niftyPrice,
      regularMarketChange: niftyChange,
      regularMarketChangePercent: (niftyChange / niftyPrice * 100).toFixed(2)
    },
    sensex: {
      regularMarketPrice: sensexPrice,
      regularMarketChange: sensexChange,
      regularMarketChangePercent: (sensexChange / sensexPrice * 100).toFixed(2)
    }
  };
};

export const getMockTopMovers = () => {
  const stocksList = [
    { symbol: 'RELIANCE.NS', name: 'Reliance Industries' },
    { symbol: 'TCS.NS', name: 'Tata Consultancy Services' },
    { symbol: 'HDFCBANK.NS', name: 'HDFC Bank' },
    { symbol: 'INFY.NS', name: 'Infosys' },
    { symbol: 'ICICIBANK.NS', name: 'ICICI Bank' },
    { symbol: 'HINDUNILVR.NS', name: 'Hindustan Unilever' },
    { symbol: 'KOTAKBANK.NS', name: 'Kotak Mahindra Bank' },
    { symbol: 'ITC.NS', name: 'ITC' },
    { symbol: 'BAJFINANCE.NS', name: 'Bajaj Finance' },
    { symbol: 'SBIN.NS', name: 'State Bank of India' },
    { symbol: 'BHARTIARTL.NS', name: 'Bharti Airtel' },
    { symbol: 'ASIANPAINT.NS', name: 'Asian Paints' },
    { symbol: 'WIPRO.NS', name: 'Wipro' },
    { symbol: 'SUNPHARMA.NS', name: 'Sun Pharmaceutical' },
    { symbol: 'AXISBANK.NS', name: 'Axis Bank' }
  ];

  // Create an array of stocks with random price changes
  const stocksWithChanges = stocksList.map(stock => {
    const basePrice = 500 + Math.random() * 2000;
    const priceChange = (Math.random() * 60) - 20; // Range from -20 to +40
    const percentChange = (priceChange / basePrice) * 100;
    
    return {
      symbol: stock.symbol,
      name: stock.name,
      regularMarketPrice: basePrice.toFixed(2),
      regularMarketChange: priceChange.toFixed(2),
      regularMarketChangePercent: percentChange.toFixed(2)
    };
  });

  // Sort for gainers and losers
  const sortedByChange = [...stocksWithChanges].sort((a, b) => 
    parseFloat(b.regularMarketChangePercent) - parseFloat(a.regularMarketChangePercent)
  );

  return {
    gainers: sortedByChange.slice(0, 5),
    losers: sortedByChange.slice(-5).reverse()
  };
}; 