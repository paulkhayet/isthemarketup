import { MongoClient } from 'mongodb';

export const revalidate = 0;

export const metadata = {
  title: 'Is The Market Up?',
  description: 'Check if the stock market is up or down today.',
};

export default async function RootLayout({ children }) {
  // Fetch market status from the database
  const { marketStatus } = await getMarketStatus();

  // Determine background color based on market status
  const backgroundColor = marketStatus === 'Up' ? '#99e8a4' : '#f0c0c0';

  return (
    <html lang="en">
      <body style={{ ...bodyStyle, backgroundColor }}>
        <main style={mainStyle}>{children}</main>
      </body>
    </html>
  );
}

// Function to fetch market status from MongoDB
async function getMarketStatus() {
  const mongoUri = 'mongodb+srv://paulkhayet:Jessie0987@marketdata.tmnkr.mongodb.net/?retryWrites=true&w=majority&appName=MarketData';

  let client;
  try {
    client = await MongoClient.connect(mongoUri);
    const db = client.db('SP500'); // Updated database name
    const collection = db.collection('Quote'); // Collection name is Quote

    // Fetch the document for SPY
    const doc = await collection.findOne({ symbol: 'SPY' });

    if (!doc || !doc.marketStatus) {
      return { marketStatus: 'Unavailable' };
    }

    return { marketStatus: doc.marketStatus };

  } catch (error) {
    console.error('Error fetching market data:', error.message);
    return { marketStatus: 'Unavailable' };
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// Inline styles
const bodyStyle = {
  margin: 0,
  padding: 0,
  fontFamily: 'Arial, sans-serif',
};

const mainStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: 'calc(100vh - 60px)',
};
