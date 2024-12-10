import { MongoClient } from 'mongodb';

export const revalidate = 0;

export const metadata = {
  title: 'Is The Market Up?',
  description: 'Check if the stock market is up or down today.',
};

// The page is a Server Component by default
export default async function Page() {
  const {
    sp500Status,
    sp500Percent,
    nasdaqStatus,
    nasdaqPercent,
    dowStatus,
    dowPercent,
  } = await getMarketData();

  if (sp500Status === 'Unavailable') {
    return (
      <div style={containerStyle}>
        <h1>The Market Data is Unavailable Today</h1>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <h1 style={mainTextStyle}>
        The S&P 500 is {sp500Status} Today by {sp500Percent}%
      </h1>

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

async function getMarketData() {
  const mongoUri = 'mongodb+srv://paulkhayet:Jessie0987@marketdata.tmnkr.mongodb.net/?retryWrites=true&w=majority&appName=MarketData';

  let client;
  try {
    client = await MongoClient.connect(mongoUri);
    const db = client.db('IndexFunds');

    // Fetch SP500 (SPY)
    const sp500Doc = await db.collection('SP500').findOne({ symbol: 'SPY' });
    const sp500 = formatMarketData(sp500Doc);

    // Fetch NASDAQ (QQQ)
    const nasdaqDoc = await db.collection('NASDAQ').findOne({ symbol: 'QQQ' });
    const nasdaq = formatMarketData(nasdaqDoc);

    // Fetch DOW30 (DIA)
    const dowDoc = await db.collection('DOW30').findOne({ symbol: 'DIA' });
    const dow = formatMarketData(dowDoc);

    return {
      sp500Status: sp500.marketStatus,
      sp500Percent: sp500.changePercent,
      nasdaqStatus: nasdaq.marketStatus,
      nasdaqPercent: nasdaq.changePercent,
      dowStatus: dow.marketStatus,
      dowPercent: dow.changePercent,
    };
  } catch (error) {
    console.error('Error fetching market data:', error.message);
    return {
      sp500Status: 'Unavailable',
      sp500Percent: null,
      nasdaqStatus: 'Unavailable',
      nasdaqPercent: null,
      dowStatus: 'Unavailable',
      dowPercent: null,
    };
  } finally {
    if (client) {
      await client.close();
    }
  }
}

function formatMarketData(doc) {
  if (!doc || typeof doc.changePercent !== 'number' || !doc.marketStatus) {
    return { marketStatus: 'Unavailable', changePercent: null };
  }
  return {
    marketStatus: doc.marketStatus,
    changePercent: Math.abs(doc.changePercent).toFixed(2),
  };
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
  justifyContent: 'center', // Centers vertically
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
};
