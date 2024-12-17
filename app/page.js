// page.js (Server Component)
import { MongoClient } from 'mongodb';
import PageContent from './PageContent'; // A separate client component

export const revalidate = 0;

export const metadata = {
  title: 'Is The Market Up?',
  description: 'Check if the stock market is up or down today.',
};

export default async function Page() {
  const {
    sp500Status,
    sp500Percent,
    nasdaqStatus,
    nasdaqPercent,
    dowStatus,
    dowPercent,
  } = await getMarketData();

  return (
    <PageContent
      sp500Status={sp500Status}
      sp500Percent={sp500Percent}
      nasdaqStatus={nasdaqStatus}
      nasdaqPercent={nasdaqPercent}
      dowStatus={dowStatus}
      dowPercent={dowPercent}
    />
  );
}

async function getMarketData() {
  const mongoUri = process.env.MONGO_URI;

  let client;
  try {
    client = await MongoClient.connect(mongoUri);
    const db = client.db('IndexFunds');

    const sp500Doc = await db.collection('SP500').findOne({ symbol: 'SPY' });
    const nasdaqDoc = await db.collection('NASDAQ').findOne({ symbol: 'QQQ' });
    const dowDoc = await db.collection('DOW30').findOne({ symbol: 'DIA' });

    const sp500 = formatMarketData(sp500Doc);
    const nasdaq = formatMarketData(nasdaqDoc);
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
