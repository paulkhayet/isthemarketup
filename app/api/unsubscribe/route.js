import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

export async function POST(request) {
  const { MONGO_URI } = process.env;

  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
    }

    const client = await MongoClient.connect(MONGO_URI);
    const db = client.db('IndexFunds');

    const result = await db.collection('Subscribers').deleteOne({ email });
    await client.close();

    if (result.deletedCount === 1) {
      return NextResponse.json({ message: 'Unsubscribed successfully!' }, { status: 200 });
    } else {
      return NextResponse.json({ error: 'Email not found in our records.' }, { status: 404 });
    }
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
