import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

export async function POST(request) {
  const { MONGO_URI } = process.env;

  let client;
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
    }

    client = await MongoClient.connect(MONGO_URI);
    const db = client.db('IndexFunds');

    // Check if email already exists
    const existing = await db.collection('Subscribers').findOne({ email });
    if (existing) {
      return NextResponse.json({ error: 'Email already subscribed.' }, { status: 400 });
    }

    await db.collection('Subscribers').insertOne({ email });

    return NextResponse.json({ message: 'Subscribed successfully!' }, { status: 200 });
  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    if (client) {
      await client.close();
    }
  }
}
