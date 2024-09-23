import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <div className="main-content">
        <h1 className="status-text">YES</h1>
        <p className="percentage-text">0.5%</p>
        <p className="index-name">S&P 500</p>
      </div>
      <div className="other-indexes">
        <div className="index-card">
          <h2 className="status-text">YES</h2>
          <p className="percentage-text">0.3%</p>
          <p className="index-name">Nasdaq</p>
        </div>
        <div className="index-card">
          <h2 className="status-text">NO</h2>
          <p className="percentage-text">-0.2%</p>
          <p className="index-name">Dow Jones</p>
        </div>
        <div className="index-card">
          <h2 className="status-text">YES</h2>
          <p className="percentage-text">1.0%</p>
          <p className="index-name">Russell 2000</p>
        </div>
      </div>
    </div>
  );
}

export default App;
