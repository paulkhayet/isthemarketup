import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

export const revalidate = 0;

export async function GET() {
  try {
    const { MONGO_URI, MAILGUN_API_KEY, MAILGUN_DOMAIN, MAILGUN_SENDER } = process.env;

    // Connect to MongoDB
    const client = await MongoClient.connect(MONGO_URI);
    const db = client.db('IndexFunds');

    // Fetch data for SPY, QQQ, DIA
    const sp500Doc = await db.collection('SP500').findOne({ symbol: 'SPY' });
    const nasdaqDoc = await db.collection('NASDAQ').findOne({ symbol: 'QQQ' });
    const dowDoc = await db.collection('DOW30').findOne({ symbol: 'DIA' });

    const sp500 = formatMarketData(sp500Doc);
    const nasdaq = formatMarketData(nasdaqDoc);
    const dow = formatMarketData(dowDoc);

    // Fetch subscribers
    const subscribers = await db.collection('Subscribers').find({}).toArray();

    // Close MongoDB client
    await client.close();

    if (subscribers.length === 0) {
      return NextResponse.json({ message: 'No subscribers.' });
    }

    // Prepare HTML email content
    const htmlContent = getEmailHTML(sp500, nasdaq, dow);

    // Send email using Mailgun
    const auth = 'Basic ' + Buffer.from(`api:${MAILGUN_API_KEY}`).toString('base64');
    const formData = new URLSearchParams();
    formData.append('from', MAILGUN_SENDER);
    formData.append('to', subscribers.map(s => s.email).join(','));
    formData.append('subject', 'Daily Market Update');
    formData.append('html', htmlContent);

    const response = await fetch(`https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': auth,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData
    });

    const result = await response.json();
    console.log('Mailgun response:', result);

    return NextResponse.json({ status: 'Emails sent', result });
  } catch (error) {
    console.error('Error sending emails:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
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

function getEmailHTML(sp500, nasdaq, dow) {
  // Determine background color based on SP500 status
  let bodyBackgroundColor = '#636363'; // default if flat/unavailable
  if (sp500.marketStatus === 'Up') {
    bodyBackgroundColor = '#99e8a4'; 
  } else if (sp500.marketStatus === 'Down') {
    bodyBackgroundColor = '#f0c0c0';
  } else if (sp500.marketStatus === 'Flat') {
    bodyBackgroundColor = '#636363';
  }

  // Choose text colors for better contrast
  const headingColor = '#4A0033';
  const boxTextColor = '#4A0033';
  const bodyTextColor = '#333333';

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>Market Update</title>
<style>
  body { margin:0; padding:0; }
</style>
</head>
<body style="margin:0; padding:0;">
  <!-- Full-width background table -->
  <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background:${bodyBackgroundColor};">
    <tr>
      <td align="center" valign="top">
        <table border="0" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%; background:${bodyBackgroundColor}; padding:20px; font-family: Arial, sans-serif;">
          <tr>
            <td style="text-align:center;">
              <h1 style="margin:0; color:${headingColor};">
                The S&P 500 is ${sp500.marketStatus} Today by ${sp500.changePercent}%
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding-top:30px;">
              <!-- NASDAQ Box -->
              <div style="
                margin:0 auto 20px auto;
                max-width:300px;
                border-radius:10px;
                border:5px solid black;
                padding:20px;
                background:${getBoxColor(nasdaq.marketStatus)};
                text-align:center;">
                <h2 style="margin:0; font-size:18px; color:${boxTextColor};">
                  NASDAQ ${nasdaq.marketStatus} by ${nasdaq.changePercent}%
                </h2>
              </div>

              <!-- DOW30 Box -->
              <div style="
                margin:0 auto 20px auto;
                max-width:300px;
                border-radius:10px;
                border:5px solid black;
                padding:20px;
                background:${getBoxColor(dow.marketStatus)};
                text-align:center;">
                <h2 style="margin:0; font-size:18px; color:${boxTextColor};">
                  DOW30 ${dow.marketStatus} by ${dow.changePercent}%
                </h2>
              </div>
            </td>
          </tr>
          <tr>
            <td style="text-align:center; padding-top:30px;">
              <p style="margin:0; font-size:12px; color:${bodyTextColor};">
                Data updated at 1:30 PM PST daily, showing market closing prices.
              </p>
              <p style="margin:10px 0 0 0; font-size:12px; color:${bodyTextColor};">
                If you no longer wish to receive these emails, <a href="https://www.arethemarketsup.com/unsubscribe" style="color:${bodyTextColor}; text-decoration:underline;">click here to unsubscribe</a>.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

function getStatusClass(status) {
  if (status === 'Up') return 'up';
  if (status === 'Flat') return 'flat';
  if (status === 'Down') return 'down';
  return 'unavailable';
}

function getBoxColor(status) {
  if (status === 'Up') return '#66b366';
  if (status === 'Flat') return '#404040';
  if (status === 'Down') return '#cc9999';
  return '#cc9999';
}
