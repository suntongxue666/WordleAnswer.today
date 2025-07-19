import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 简化的中间件，只处理www到非www的重定向
export function middleware(request: NextRequest) {
  try {
    const url = request.nextUrl.clone();
    const hostname = request.headers.get('host') || '';
    
    // 只处理www子域名重定向，避免其他复杂逻辑
    if (hostname.startsWith('www.')) {
      // 创建不带www的URL
      const nonWwwHost = hostname.replace(/^www\./, '');
      url.host = nonWwwHost;
      
      // 301永久重定向到非www版本
      return NextResponse.redirect(url, { status: 301 });
    }
    
    // 所有其他请求直接通过
    return NextResponse.next();
  } catch (error) {
    // 出现任何错误，直接通过请求，不进行重定向
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
}

// 限制中间件只应用于主要页面路由
export const config = {
  matcher: [
    // 只匹配根路径和主要页面路径
    '/',
    '/archive',
    '/wordle/:path*',
    '/privacy-policy',
    '/terms-of-service',
    '/disclaimer'
  ],
};