import React, { useState, useEffect } from 'react';
import '../styles/Portfolio.css';
import TradeModal from '../components/TradeModal';
import { useTrade } from '../context/TradeContext';

const Portfolio = () => {
  const { holdings, transactions, handleTrade } = useTrade();
  
  // Portfolio data state
  const [portfolioData, setPortfolioData] = useState({
    totalValue: 0,
    todayChange: 0,
    todayChangePercent: 0,
    totalInvestment: 0,
    totalGain: 0,
    totalGainPercent: 0
  });

  // Calculate portfolio data whenever holdings change
  useEffect(() => {
    if (holdings && holdings.length > 0) {
      const totalValue = holdings.reduce((sum, stock) => sum + stock.value, 0);
      const totalInvestment = holdings.reduce((sum, stock) => sum + (stock.shares * stock.avgPrice), 0);
      const totalGain = totalValue - totalInvestment;
      const totalGainPercent = totalInvestment > 0 ? (totalGain / totalInvestment) * 100 : 0;
      
      setPortfolioData({
        totalValue,
        totalInvestment,
        totalGain,
        totalGainPercent,
        todayChange: totalGain,
        todayChangePercent: totalGainPercent
      });
    } else {
      setPortfolioData({
        totalValue: 0,
        todayChange: 0,
        todayChangePercent: 0,
        totalInvestment: 0,
        totalGain: 0,
        totalGainPercent: 0
      });
    }
  }, [holdings]);

  const [selectedStock, setSelectedStock] = useState(null);
  const [tradeType, setTradeType] = useState(null);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);

  const formatCurrency = (value) => {
    if (value == null) return '₹0.00';
    return `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="portfolio-page">
      <div className="portfolio-overview">
        <div className="portfolio-header">
          <div className="portfolio-summary">
            <div className="summary-item">
              <h3>Portfolio Value</h3>
              <div className="value-container">
                <span className="total-value">{formatCurrency(portfolioData.totalValue)}</span>
                <div className={`change-container ${portfolioData.todayChange >= 0 ? 'positive' : 'negative'}`}>
                  <span className="change">
                    {portfolioData.todayChange >= 0 ? '+' : ''}
                    {formatCurrency(portfolioData.todayChange)}
                  </span>
                  <span className="change-percent">
                    ({portfolioData.todayChange >= 0 ? '+' : ''}
                    {portfolioData.todayChangePercent?.toFixed(2) || '0.00'}%)
                  </span>
                </div>
              </div>
            </div>

            <div className="summary-item">
              <h3>Total Investment</h3>
              <span className="metric-value">{formatCurrency(portfolioData.totalInvestment)}</span>
            </div>

            <div className="summary-item">
              <h3>Total Gain/Loss</h3>
              <div className={`metric-value ${portfolioData.totalGain >= 0 ? 'positive' : 'negative'}`}>
                {formatCurrency(portfolioData.totalGain)}
                <span className="metric-percent">
                  ({portfolioData.totalGain >= 0 ? '+' : ''}
                  {portfolioData.totalGainPercent?.toFixed(2) || '0.00'}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="holdings-section">
        <div className="section-header">
          <h2>Holdings</h2>
        </div>
        <div className="holdings-table">
          <div className="table-header">
            <div className="col-symbol">Symbol</div>
            <div className="col-shares">Shares</div>
            <div className="col-avg-price">Avg. Price</div>
            <div className="col-current">Current</div>
            <div className="col-value">Value</div>
            <div className="col-gain">Gain/Loss</div>
            <div className="col-actions">Actions</div>
          </div>
          <div className="table-body">
            {holdings && holdings.length > 0 ? (
              holdings.map((holding, index) => (
                <div key={index} className="table-row">
                  <div className="col-symbol">{holding.symbol}</div>
                  <div className="col-shares">{holding.shares}</div>
                  <div className="col-avg-price">{formatCurrency(holding.avgPrice)}</div>
                  <div className="col-current">{formatCurrency(holding.currentPrice)}</div>
                  <div className="col-value">{formatCurrency(holding.value)}</div>
                  <div className={`col-gain ${holding.gain >= 0 ? 'positive' : 'negative'}`}>
                    {formatCurrency(Math.abs(holding.gain))}
                    <span className="gain-percent">
                      ({holding.gain >= 0 ? '+' : '-'}
                      {Math.abs(holding.gainPercent)?.toFixed(2) || '0.00'}%)
                    </span>
                  </div>
                  <div className="col-actions">
                    <button
                      className="action-btn buy"
                      onClick={() => {
                        setSelectedStock(holding);
                        setTradeType('buy');
                        setIsTradeModalOpen(true);
                      }}
                    >
                      Buy
                    </button>
                    <button
                      className="action-btn sell"
                      onClick={() => {
                        setSelectedStock(holding);
                        setTradeType('sell');
                        setIsTradeModalOpen(true);
                      }}
                    >
                      Sell
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-message">No holdings to display</div>
            )}
          </div>
        </div>
      </div>

      <div className="transactions-section">
        <h2>Recent Transactions</h2>
        <div className="transactions-table">
          <div className="table-header">
            <div className="col-date">Date</div>
            <div className="col-symbol">Symbol</div>
            <div className="col-type">Type</div>
            <div className="col-shares">Shares</div>
            <div className="col-price">Price</div>
            <div className="col-total">Total</div>
          </div>
          <div className="table-body">
            {transactions && transactions.length > 0 ? (
              transactions.map((transaction, index) => (
                <div key={index} className="table-row">
                  <div className="col-date">{new Date(transaction.date).toLocaleDateString('en-IN')}</div>
                  <div className="col-symbol">{transaction.symbol}</div>
                  <div className={`col-type ${transaction.type.toLowerCase()}`}>{transaction.type}</div>
                  <div className="col-shares">{transaction.shares}</div>
                  <div className="col-price">{formatCurrency(transaction.price)}</div>
                  <div className="col-total">{formatCurrency(transaction.total)}</div>
                </div>
              ))
            ) : (
              <div className="empty-message">No transactions to display</div>
            )}
          </div>
        </div>
      </div>

      <TradeModal
        isOpen={isTradeModalOpen}
        onClose={() => {
          setIsTradeModalOpen(false);
          setSelectedStock(null);
          setTradeType(null);
        }}
        stock={selectedStock ? {
          ...selectedStock,
          currentPrice: selectedStock.currentPrice || 0,
          shares: selectedStock.shares || 0,
          avgPrice: selectedStock.avgPrice || 0,
          name: selectedStock.name || selectedStock.symbol
        } : null}
        type={tradeType}
        onTrade={handleTrade}
      />
    </div>
  );
};

export default Portfolio; 