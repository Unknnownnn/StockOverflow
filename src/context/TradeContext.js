import React, { createContext, useState, useContext, useEffect } from 'react';

const TradeContext = createContext();

export const TradeProvider = ({ children }) => {
  const [holdings, setHoldings] = useState(() => {
    const savedHoldings = localStorage.getItem('holdings');
    return savedHoldings ? JSON.parse(savedHoldings) : [];
  });

  const [transactions, setTransactions] = useState(() => {
    const savedTransactions = localStorage.getItem('transactions');
    return savedTransactions ? JSON.parse(savedTransactions) : [];
  });

  const handleTrade = (tradeDetails) => {
    try {
      // Add transaction to history with all necessary details
      const newTransaction = {
        ...tradeDetails,
        date: new Date().toISOString(),
        shares: Number(tradeDetails.shares),
        price: Number(tradeDetails.price),
        total: Number(tradeDetails.shares) * Number(tradeDetails.price)
      };
      const updatedTransactions = [newTransaction, ...transactions];
      setTransactions(updatedTransactions);
      localStorage.setItem('transactions', JSON.stringify(updatedTransactions));

      // Update holdings
      let updatedHoldings = [...holdings];
      const stockIndex = updatedHoldings.findIndex(h => h.symbol === tradeDetails.symbol);

      if (tradeDetails.type === 'BUY') {
        if (stockIndex === -1) {
          // New stock purchase
          const newHolding = {
            symbol: tradeDetails.symbol,
            name: tradeDetails.name || tradeDetails.symbol,
            shares: Number(tradeDetails.shares),
            avgPrice: Number(tradeDetails.price),
            currentPrice: Number(tradeDetails.price),
            value: Number(tradeDetails.shares) * Number(tradeDetails.price),
            gain: 0,
            gainPercent: 0
          };
          updatedHoldings = [...updatedHoldings, newHolding];
        } else {
          // Existing stock
          const stock = updatedHoldings[stockIndex];
          const newShares = Number(stock.shares) + Number(tradeDetails.shares);
          const newTotalValue = (stock.shares * stock.avgPrice) + (Number(tradeDetails.shares) * Number(tradeDetails.price));
          stock.shares = newShares;
          stock.avgPrice = newTotalValue / newShares;
          stock.currentPrice = Number(tradeDetails.price);
          stock.value = stock.shares * stock.currentPrice;
          stock.gain = stock.value - (stock.shares * stock.avgPrice);
          stock.gainPercent = (stock.gain / (stock.shares * stock.avgPrice)) * 100;
        }
      } else if (tradeDetails.type === 'SELL') {
        if (stockIndex === -1) {
          throw new Error('Cannot sell stock that is not in holdings');
        }
        // Sell
        const stock = updatedHoldings[stockIndex];
        if (Number(tradeDetails.shares) > stock.shares) {
          throw new Error('Cannot sell more shares than owned');
        }
        stock.shares -= Number(tradeDetails.shares);
        // Remove the stock if shares become 0
        if (stock.shares <= 0) {
          updatedHoldings = updatedHoldings.filter(h => h.symbol !== tradeDetails.symbol);
        } else {
          stock.currentPrice = Number(tradeDetails.price);
          stock.value = stock.shares * stock.currentPrice;
          stock.gain = stock.value - (stock.shares * stock.avgPrice);
          stock.gainPercent = (stock.gain / (stock.shares * stock.avgPrice)) * 100;
        }
      }

      // Update state and localStorage
      setHoldings(updatedHoldings);
      localStorage.setItem('holdings', JSON.stringify(updatedHoldings));

    } catch (error) {
      console.error('Error processing trade:', error);
      throw error; // Re-throw to be handled by the UI
    }
  };

  // Update stock prices periodically (simulate real-time updates)
  useEffect(() => {
    const updatePrices = () => {
      if (holdings.length === 0) return;

      const updatedHoldings = holdings.map(stock => {
        // Simulate small price changes (-2% to +2%)
        const priceChange = stock.currentPrice * (Math.random() * 0.04 - 0.02);
        const newPrice = stock.currentPrice + priceChange;
        
        return {
          ...stock,
          currentPrice: newPrice,
          value: stock.shares * newPrice,
          gain: (stock.shares * newPrice) - (stock.shares * stock.avgPrice),
          gainPercent: ((stock.shares * newPrice) - (stock.shares * stock.avgPrice)) / (stock.shares * stock.avgPrice) * 100
        };
      });

      setHoldings(updatedHoldings);
      localStorage.setItem('holdings', JSON.stringify(updatedHoldings));
    };

    // Update prices every 5 seconds
    const interval = setInterval(updatePrices, 5000);
    return () => clearInterval(interval);
  }, [holdings]);

  return (
    <TradeContext.Provider value={{ holdings, transactions, handleTrade }}>
      {children}
    </TradeContext.Provider>
  );
};

export const useTrade = () => {
  const context = useContext(TradeContext);
  if (!context) {
    throw new Error('useTrade must be used within a TradeProvider');
  }
  return context;
}; 