// middleware.js

import { NextResponse } from 'next/server';

export function middleware(req) {
  // Ambil header Authorization
  const auth = req.headers.get('authorization');

  // Cek apakah sesuai token rahasia dari .env
  if (auth !== `Bearer ${process.env.API_TOKEN}`) {
    return new NextResponse(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Lanjut ke handler jika token benar
  return NextResponse.next();
}

// Hanya berlaku untuk endpoint /api/stock
export const config = {
  matcher: '/api/stock',
};
