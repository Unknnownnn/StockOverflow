import React, { useState } from 'react';
import { 
  fetchMarketData, 
  fetchHistoricalData, 
  fetchTopGainers, 
  fetchTopLosers,
  fetchIndianIndices,
  fetchQuoteSummary
} from '../services/yahooFinanceAPI';
import '../styles/ApiTesting.css';

const ApiTesting = () => {
  const [symbol, setSymbol] = useState('AAPL');
  const [apiResult, setApiResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFunction, setSelectedFunction] = useState('fetchQuoteSummary');
  const [interval, setInterval] = useState('1d');
  const [range, setRange] = useState('1mo');
  const [modules, setModules] = useState('defaultKeyStatistics,assetProfile');

  const handleSymbolChange = (e) => {
    setSymbol(e.target.value);
  };

  const handleFunctionChange = (e) => {
    setSelectedFunction(e.target.value);
  };

  const handleIntervalChange = (e) => {
    setInterval(e.target.value);
  };

  const handleRangeChange = (e) => {
    setRange(e.target.value);
  };

  const handleModulesChange = (e) => {
    setModules(e.target.value);
  };

  const testApiCall = async () => {
    setLoading(true);
    setError(null);
    setApiResult(null);

    try {
      let result;

      switch (selectedFunction) {
        case 'fetchQuoteSummary':
          result = await fetchQuoteSummary(symbol, modules);
          break;
        case 'fetchMarketData':
          result = await fetchMarketData(symbol);
          break;
        case 'fetchHistoricalData':
          result = await fetchHistoricalData(symbol, interval, range);
          break;
        case 'fetchTopGainers':
          result = await fetchTopGainers();
          break;
        case 'fetchTopLosers':
          result = await fetchTopLosers();
          break;
        case 'fetchIndianIndices':
          result = await fetchIndianIndices();
          break;
        default:
          result = await fetchQuoteSummary(symbol, modules);
      }

      setApiResult(result);
    } catch (err) {
      setError(err.message || 'An error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="api-testing-container">
      <h1>Yahoo Finance API Testing</h1>
      
      <div className="form-group">
        <label htmlFor="function-select">Select API Function:</label>
        <select 
          id="function-select" 
          value={selectedFunction} 
          onChange={handleFunctionChange}
          className="form-control"
        >
          <option value="fetchQuoteSummary">fetchQuoteSummary (Example)</option>
          <option value="fetchMarketData">fetchMarketData</option>
          <option value="fetchHistoricalData">fetchHistoricalData</option>
          <option value="fetchTopGainers">fetchTopGainers</option>
          <option value="fetchTopLosers">fetchTopLosers</option>
          <option value="fetchIndianIndices">fetchIndianIndices</option>
        </select>
      </div>

      {(selectedFunction === 'fetchMarketData' || 
        selectedFunction === 'fetchHistoricalData' || 
        selectedFunction === 'fetchQuoteSummary') && (
        <div className="form-group">
          <label htmlFor="symbol-input">Symbol:</label>
          <input 
            id="symbol-input" 
            type="text" 
            value={symbol} 
            onChange={handleSymbolChange} 
            placeholder="Enter stock symbol (e.g., AAPL)"
            className="form-control"
          />
        </div>
      )}

      {selectedFunction === 'fetchQuoteSummary' && (
        <div className="form-group">
          <label htmlFor="modules-input">Modules:</label>
          <input 
            id="modules-input" 
            type="text" 
            value={modules} 
            onChange={handleModulesChange} 
            placeholder="Module names (comma-separated)"
            className="form-control"
          />
          <div className="helper-text">
            Available modules: defaultKeyStatistics, assetProfile, summaryProfile, 
            summaryDetail, esgScores, price, incomeStatementHistory, 
            incomeStatementHistoryQuarterly, balanceSheetHistory, 
            balanceSheetHistoryQuarterly, cashflowStatementHistory, 
            cashflowStatementHistoryQuarterly, majorHoldersBreakdown, 
            insiderTransactions, insiderHolders, majorDirectHolders, 
            financialData, calendarEvents, etc.
          </div>
        </div>
      )}

      {selectedFunction === 'fetchHistoricalData' && (
        <>
          <div className="form-group">
            <label htmlFor="interval-select">Interval:</label>
            <select 
              id="interval-select" 
              value={interval} 
              onChange={handleIntervalChange}
              className="form-control"
            >
              <option value="1d">1 Day</option>
              <option value="1wk">1 Week</option>
              <option value="1mo">1 Month</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="range-select">Range:</label>
            <select 
              id="range-select" 
              value={range} 
              onChange={handleRangeChange}
              className="form-control"
            >
              <option value="1d">1 Day</option>
              <option value="5d">5 Days</option>
              <option value="1mo">1 Month</option>
              <option value="3mo">3 Months</option>
              <option value="6mo">6 Months</option>
              <option value="1y">1 Year</option>
              <option value="2y">2 Years</option>
              <option value="5y">5 Years</option>
              <option value="10y">10 Years</option>
              <option value="ytd">Year to Date</option>
              <option value="max">Max</option>
            </select>
          </div>
        </>
      )}

      <button 
        onClick={testApiCall} 
        disabled={loading}
        className="btn"
      >
        {loading ? 'Loading...' : 'Test API Call'}
      </button>

      {error && (
        <div className="error-container">
          <h3>Error:</h3>
          <p>{error}</p>
        </div>
      )}

      {apiResult && (
        <div className="result-container">
          <h3>API Response:</h3>
          <div className="json-display">
            <pre>{JSON.stringify(apiResult, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiTesting; 