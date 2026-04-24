import { NextResponse } from 'next/server';

export async function GET() {
  console.log('🧪 [sinalite/test] Test endpoint called');
  return NextResponse.json({ 
    success: true, 
    message: 'SinaLite test endpoint working',
    timestamp: new Date().toISOString(),
  });
}

export async function POST() {
  console.log('🧪 [sinalite/test] POST test endpoint called');
  return NextResponse.json({ 
    success: true, 
    message: 'SinaLite POST test working',
    timestamp: new Date().toISOString(),
  });
}
