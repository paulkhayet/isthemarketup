import { MongoClient } from 'mongodb';

export const revalidate = 0;

export const metadata = {
  title: 'Is The Market Up?',
  description: 'Check if the stock market is up or down today.',
};

// The page is a Server Component by default, so you can fetch data directly here
export default async function Page() {
  const { marketStatus, changePercent } = await getMarketData();

  if (marketStatus === 'Unavailable') {
    return (
      <div style={containerStyle}>
        <h1>The Market Data is Unavailable Today</h1>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <h1>The Market is {marketStatus} Today by {changePercent}%</h1>
    </div>
  );
}

async function getMarketData() {
  const mongoUri = 'mongodb+srv://paulkhayet:Jessie0987@marketdata.tmnkr.mongodb.net/?retryWrites=true&w=majority&appName=MarketData';

  let client;
  try {
    client = await MongoClient.connect(mongoUri);
    const db = client.db('SP500'); // Updated database name
    const collection = db.collection('Quote'); // Collection name remains "Quote" as per your output

    // Fetch the document for SPY
    const doc = await collection.findOne({ symbol: 'SPY' });

    if (!doc || typeof doc.changePercent !== 'number' || !doc.marketStatus) {
      return { marketStatus: 'Unavailable', changePercent: null };
    }

    return {
      marketStatus: doc.marketStatus,
      changePercent: Math.abs(doc.changePercent).toFixed(2),
    };
  } catch (error) {
    console.error('Error fetching market data:', error.message);
    return { marketStatus: 'Unavailable', changePercent: null };
  } finally {
    if (client) {
      await client.close();
    }
  }
}

const containerStyle = {
  display: 'flex',
  height: '100vh',
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'column',
};
