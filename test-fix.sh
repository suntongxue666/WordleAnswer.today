#!/bin/bash
# 测试爬虫修复脚本

echo "🔍 测试爬虫API修复..."

# 启动开发服务器（后台运行）
echo "📡 启动开发服务器..."
npm run dev -p 3001 &
DEV_PID=$!
sleep 5

# 测试API端点
echo ""
echo "✅ 测试1: 检查API基本功能"
curl -s "http://localhost:3001/api/wordle-scrape?date=TODAY" | head -5

echo ""
echo "✅ 测试2: 检查cron端点"
curl -s "http://localhost:3001/api/cron-scrape" | jq .

echo ""
echo "✅ 测试3: 手动测试特定日期爬取"
curl -s "http://localhost:3001/api/wordle-scrape?date=2025-07-11" | jq -r '.answer // "FAILED"'

# 清理
echo ""
echo "🧹 清理进程..."
kill $DEV_PID 2>/dev/null

echo ""
echo "📋 修复总结:"
echo "1. ✅ 修复了API对'TODAY'参数的支持"
echo "2. ✅ 创建了Vercel cron配置文件"
echo "3. ✅ 添加了App Router兼容的cron处理器"
echo "4. ✅ 更新了GitHub Actions作为备用"
echo "5. ✅ 完善了监控和文档"

echo ""
echo "🚀 下一步:"
echo "1. 部署到Vercel"
echo "2. 在Vercel中配置环境变量 CRON_SECRET 和 SUPABASE_SERVICE_ROLE_KEY"
echo "3. 监控cron任务执行状态"