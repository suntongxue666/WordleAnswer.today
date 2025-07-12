#!/bin/bash
# 调试爬虫问题并手动抓取数据

echo "🔍 调试爬虫API..."

# 测试本地开发环境
echo "启动本地开发服务器..."
npm run dev &
DEV_PID=$!
sleep 5

echo ""
echo "📅 测试July 11数据抓取..."
curl -v "http://localhost:3001/api/wordle-scrape?date=2025-07-11" | head -20

echo ""
echo "📅 测试July 12数据抓取..."  
curl -v "http://localhost:3001/api/wordle-scrape?date=2025-07-12" | head -20

echo ""
echo "🧹 清理进程..."
kill $DEV_PID 2>/dev/null

echo "完成调试测试"