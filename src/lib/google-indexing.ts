import axios from 'axios';
import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

// 配置 Google API 凭证
const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://wordleanswer.today';

/**
 * 通知 Google 索引新内容或更新的内容
 * @param url 要索引的 URL
 * @param type 'URL_UPDATED' 或 'URL_DELETED'
 */
export async function notifyGoogleIndexing(url: string, type: 'URL_UPDATED' | 'URL_DELETED' = 'URL_UPDATED') {
  if (!GOOGLE_CLIENT_EMAIL || !GOOGLE_PRIVATE_KEY) {
    console.warn('Google API 凭证未配置，跳过索引通知');
    return null;
  }

  try {
    // 创建 JWT 客户端
    const jwtClient = new JWT(
      GOOGLE_CLIENT_EMAIL,
      undefined,
      GOOGLE_PRIVATE_KEY,
      ['https://www.googleapis.com/auth/indexing'],
    );

    // 授权客户端
    await jwtClient.authorize();

    // 创建索引 API 客户端
    const indexing = google.indexing({
      version: 'v3',
      auth: jwtClient
    });

    // 提交 URL 进行索引
    const result = await indexing.urlNotifications.publish({
      requestBody: {
        url,
        type
      }
    });

    console.log(`成功通知 Google 索引 ${url}`, result.data);
    return result.data;
  } catch (error) {
    console.error('Google 索引 API 错误:', error);
    return null;
  }
}

/**
 * 使用 Google 的 Ping URL 提交网站地图
 * 这是一个简单的备用方法，不需要 API 凭证
 */
export async function pingGoogleSitemap() {
  const sitemapUrl = `${SITE_URL}/sitemap.xml`;
  const pingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
  
  try {
    const response = await axios.get(pingUrl);
    console.log(`Google Sitemap Ping 响应: ${response.status}`);
    return response.status === 200;
  } catch (error) {
    console.error('Google Sitemap Ping 错误:', error);
    return false;
  }
}

/**
 * 在新内容抓取后自动通知 Google
 * @param date 内容日期，格式为 YYYY-MM-DD
 */
export async function notifyNewWordleAnswer(date: string) {
  // 通知首页更新
  await notifyGoogleIndexing(`${SITE_URL}/`);
  
  // 通知特定日期页面更新
  await notifyGoogleIndexing(`${SITE_URL}/wordle/${date}`);
  
  // 提交网站地图
  await pingGoogleSitemap();
  
  return true;
}