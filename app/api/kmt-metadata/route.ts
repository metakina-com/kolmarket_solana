import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    // 返回最新的 KMT 元数据
    const metadata = {
      name: "KOLMARKET TOKEN",
      symbol: "KMT",
      description: "$KMT: Redefining the Order of Web3 Influence\n\nAt kolmarket.ai, $KMT is more than just a token—it is the fuel for Web3 growth.\n\nEmpowering KOLs: Break free from centralized platform fees and monetize your influence directly.\n\nAccelerating Brands: Use $KMT to precision-target top-tier crypto leaders globally.\n\nEarn Together: Benefit from a community-driven ecosystem with buy-back mechanisms and active contributor rewards.\n\nJoin us and witness the tokenization of influence with $KMT!",
      image: "https://oss.kolmarket.ai/etPJjFNh_400x400.jpg",
      external_url: "https://kolmarket.ai",
      attributes: [
        {
          trait_type: "Network",
          value: "Solana"
        },
        {
          trait_type: "Platform",
          value: "KOLMarket.ai"
        },
        {
          trait_type: "Token Type",
          value: "Utility Token"
        },
        {
          trait_type: "Use Case",
          value: "Web3 Influence Monetization"
        }
      ],
      properties: {
        category: "token",
        creators: [
          {
            address: "8Yd5aNenpAfY9yE39f7UyV17SCwBvdYXtWJDXqajwvTf",
            share: 100
          }
        ],
        website: "https://kolmarket.ai",
        social: {
          twitter: "https://x.com/KOLMARKET",
          telegram: "https://t.me/kolmarketai",
          discord: "https://discord.gg/CQGPNpM6Nh"
        }
      }
    };

    // 设置响应头以避免缓存
    const response = NextResponse.json(metadata);
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Access-Control-Allow-Origin', '*');
    
    return response;
  } catch (error) {
    console.error('Error serving KMT metadata:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
