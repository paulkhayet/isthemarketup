import { MongoClient } from 'mongodb';

export const revalidate = 0;

export const metadata = {
  title: 'Are the Markets Up?',
  description: 'Check if the markets are up or down today.',
};

export default async function RootLayout({ children }) {
  // Fetch market status from the database
  const { marketStatus } = await getMarketStatus();

  let backgroundColor;

  if (marketStatus === 'Up') {
    // Set to green
    backgroundColor = '#99e8a4';
  } else if (marketStatus === 'Down') {
    // Set to red
    backgroundColor = '#f0c0c0';
  } else {
    // Set to grey
    backgroundColor = '#636363';
  }

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
    // Change this to match the same DB and collection as page.js
    const db = client.db('IndexFunds'); // Use the same database used in page.js
    const collection = db.collection('SP500'); // Use the same collection used in page.js
    
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
