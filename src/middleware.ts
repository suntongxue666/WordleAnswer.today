import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 不进行任何基于 Host 的重定向，交由 Vercel Domains 管理
export function middleware(_: NextRequest) {
  return NextResponse.next();
}

// 如需限定作用路径，可保留 matcher；也可删除整个中间件文件
export const config = {
  matcher: [
    '/',
    '/archive',
    '/wordle/:path*',
    '/privacy-policy',
    '/terms-of-service',
    '/disclaimer'
  ],
};
