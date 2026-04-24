import { NextRequest, NextResponse } from 'next/server';
import { getSinaLiteConfig } from '../auth';

interface ShippingRequest {
  productId: number;
  options: Record<string, string>;
  shippingInfo: {
    ShipState: string;
    ShipZip: string;
    ShipCountry: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: ShippingRequest = await request.json();
    const { productId, options, shippingInfo } = body;
    
    if (!productId || !options || !shippingInfo) {
      return NextResponse.json(
        { error: 'productId, options, and shippingInfo are required' },
        { status: 400 }
      );
    }
    
    let baseUrl: string;
    let token: string;
    
    try {
      const config = await getSinaLiteConfig();
      baseUrl = config.baseUrl;
      token = config.token;
    } catch (configError) {
      console.error('SinaLite config error:', configError);
      return NextResponse.json(
        { error: 'SinaLite integration not properly configured. Please check credentials in settings.' },
        { status: 503 }
      );
    }
    
    // Request shipping estimate from SinaLite
    const response = await fetch(`${baseUrl}/order/shippingEstimate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        items: [
          {
            productId,
            options
          }
        ],
        shippingInfo
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('SinaLite shipping error:', errorText);
      return NextResponse.json(
        { error: 'Failed to get shipping estimate from SinaLite' },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    
    // The spec says response body is:
    // {
    //   "statusCode": 200,
    //   "body": [ [ "Carrier", "Method", Price, Days ], ... ]
    // }
    
    if (data.statusCode !== 200) {
      return NextResponse.json(
        { error: 'SinaLite returned an error for shipping estimation' },
        { status: 400 }
      );
    }

    const rates = data.body.map((rate: any[]) => ({
      carrier: rate[0],
      method: rate[1],
      price: rate[2],
      days: rate[3]
    }));
    
    return NextResponse.json({
      rates
    });
    
  } catch (error) {
    console.error('SinaLite shipping error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to calculate shipping' },
      { status: 500 }
    );
  }
}
