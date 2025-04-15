import React, { useState, useEffect } from 'react';
import '../styles/TradeModal.css';

const TradeModal = ({ isOpen = true, onClose, stock, type, onTrade, onSubmit }) => {
  const [quantity, setQuantity] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (stock) {
      // Use currentPrice or price property depending on what's available
      const stockPrice = stock.currentPrice || stock.price;
      setTotal(quantity * stockPrice);
      // Reset quantity when modal opens
      setQuantity(1);
      setError('');
    }
  }, [stock, isOpen]);

  useEffect(() => {
    if (stock) {
      // Use currentPrice or price property depending on what's available
      const stockPrice = stock.currentPrice || stock.price;
      setTotal(quantity * stockPrice);
      
      // Validate quantity for sell operations
      if (type === 'sell' && stock.shares && quantity > stock.shares) {
        setError(`You can only sell up to ${stock.shares} shares`);
      } else {
        setError('');
      }
    }
  }, [quantity, stock, type]);

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    setQuantity(value);
    
    if (value <= 0) {
      setError('Quantity must be greater than 0');
    } else if (type === 'sell' && stock.shares && value > stock.shares) {
      setError(`You can only sell up to ${stock.shares} shares`);
    } else {
      setError('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (quantity <= 0) {
      setError('Quantity must be greater than 0');
      return;
    }

    if (type === 'sell' && stock.shares && quantity > stock.shares) {
      setError(`You can only sell up to ${stock.shares} shares`);
      return;
    }

    // Use the price property or currentPrice based on what's available
    const stockPrice = stock.currentPrice || stock.price;
    
    // Support both onTrade and onSubmit functions (for backward compatibility)
    const tradeData = {
      symbol: stock.symbol,
      name: stock.name,
      quantity: quantity,
      shares: quantity,
      price: stockPrice,
      total: quantity * stockPrice,
      type: type.toUpperCase()
    };
    
    if (onTrade) onTrade(tradeData);
    if (onSubmit) onSubmit(tradeData);

    // Reset form
    setQuantity(1);
    setError('');
    onClose();
  };

  if (!stock) return null;
  if (isOpen === false) return null;

  // Use price property or currentPrice based on what's available
  const stockPrice = stock.currentPrice || stock.price;
  const currencySymbol = stock.symbol && stock.symbol.includes('.NS') ? '₹' : '$';

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>&times;</button>
        <h2>{type === 'buy' ? 'Buy' : 'Sell'} {stock.symbol}</h2>
        
        <div className="stock-info">
          <div className="info-row">
            <span>Current Price:</span>
            <span className="price">{currencySymbol}{stockPrice.toFixed(2)}</span>
          </div>
          {type === 'sell' && stock.avgPrice && (
            <>
              <div className="info-row">
                <span>Average Buy Price:</span>
                <span>{currencySymbol}{stock.avgPrice.toFixed(2)}</span>
              </div>
              <div className="info-row">
                <span>Available Shares:</span>
                <span>{stock.shares}</span>
              </div>
            </>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="quantity">Quantity</label>
            <input
              type="number"
              id="quantity"
              value={quantity}
              onChange={handleQuantityChange}
              min="1"
              max={type === 'sell' && stock.shares ? stock.shares : undefined}
            />
          </div>

          <div className="trade-summary">
            <div className="info-row">
              <span>Total Amount:</span>
              <span className="total">{currencySymbol}{total.toFixed(2)}</span>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button 
            type="submit" 
            className={`trade-button ${type}`}
            disabled={quantity <= 0 || error !== ''}
          >
            {type === 'buy' ? 'Buy' : 'Sell'} {stock.symbol}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TradeModal; 