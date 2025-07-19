import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 处理域名规范化和www重定向
export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';
  
  // 检查是否是www子域名
  if (hostname.startsWith('www.')) {
    // 创建不带www的URL
    const nonWwwHost = hostname.replace(/^www\./, '');
    url.host = nonWwwHost;
    
    // 301永久重定向到非www版本
    return NextResponse.redirect(url, { status: 301 });
  }
  
  // 检查是否是HTTP请求 (在Vercel环境中通常不需要，因为Vercel自动处理HTTPS)
  if (url.protocol === 'http:' && process.env.NODE_ENV === 'production') {
    url.protocol = 'https:';
    return NextResponse.redirect(url, { status: 301 });
  }
  
  return NextResponse.next();
}

// 只对主机名请求应用中间件
export const config = {
  matcher: [
    /*
     * 匹配所有路径，但不包括:
     * 1. /api 路由
     * 2. /_next 静态文件
     * 3. /_vercel 系统文件
     * 4. 所有静态文件，如favicon.ico等
     */
    '/((?!api|_next|_vercel|.*\\..*|favicon.ico).*)',
  ],
};