"use client";

import React, { useState } from 'react';

export default function PageContent({ sp500Status, sp500Percent, nasdaqStatus, nasdaqPercent, dowStatus, dowPercent }) {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleMouseEnter = () => setShowTooltip(true);
  const handleMouseLeave = () => setShowTooltip(false);

  return (
    <div style={containerStyle}>
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <h1 style={mainTextStyle}>
          The S&P 500 is {sp500Status} Today by {sp500Percent}%
        </h1>
        {/* Information Icon with hover events */}
        <div
          style={infoIconContainerStyle}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            style={infoIconStyle}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"
            />
          </svg>
          {/* Tooltip shown conditionally */}
          {showTooltip && (
            <div style={tooltipStyle}>
                The site updates at 1:30pm PST every day, therefore it only displays the market closing price.
            </div>
          )}
        </div>
      </div>

      <div style={boxesContainerStyle}>
        <div style={getBoxStyle(nasdaqStatus)}>
          <h2>NASDAQ {nasdaqStatus} by {nasdaqPercent}%</h2>
        </div>

        <div style={getBoxStyle(dowStatus)}>
          <h2>DOW30 {dowStatus} by {dowPercent}%</h2>
        </div>
      </div>
    </div>
  );
}

function getBoxStyle(status) {
  const backgroundColor = getColorFromStatus(status);
  return {
    backgroundColor: backgroundColor,
    borderRadius: '10px',
    padding: '20px',
    minWidth: '200px',
    textAlign: 'center',
    border: '5px solid black',
  };
}

function getColorFromStatus(status) {
  if (status === 'Up') {
    return '#66b366'; // A darker green shade
  } else if (status === 'Flat') {
    return '#404040'; // A darker gray
  } else if (status === 'Down') {
    return '#cc9999'; // A darker red
  }
  return '#cc9999'; // default color if unavailable
}

const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
  boxSizing: 'border-box',
};

const mainTextStyle = {
  margin: 0,
  textAlign: 'center',
};

const boxesContainerStyle = {
  display: 'flex',
  gap: '20px',
  justifyContent: 'center',
  alignItems: 'flex-start',
  marginTop: '30px',
  flexWrap: 'wrap',
};

const infoIconContainerStyle = {
  position: 'absolute',
  top: '-10px',
  right: '-30px',
  display: 'inline-block',
  cursor: 'pointer',
};

const infoIconStyle = {
  width: '20px',
  height: '20px',
  color: '#555',
  transform: 'rotate(180deg)',
};

const tooltipStyle = {
    position: 'absolute',
    top: '30px',       // Position it below the icon
    right: '-100px',     // Slightly to the right of the icon
    backgroundColor: '#333',
    color: '#fff',
    padding: '10px',
    borderRadius: '5px',
    fontSize: '12px',
    textAlign: 'center',
    zIndex: 10,
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    maxWidth: '400px',      // Limit the width to prevent an overly long line
    boxSizing: 'border-box'
  };
  
