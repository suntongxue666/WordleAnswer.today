#!/bin/bash
# 紧急修复脚本：手动触发数据抓取

echo "🚨 紧急修复：触发数据抓取..."

# 获取今天和昨天的日期
TODAY=$(date +%Y-%m-%d)
YESTERDAY=$(date -d "1 day ago" +%Y-%m-%d 2>/dev/null || date -v-1d +%Y-%m-%d)

echo "📅 今天: $TODAY"
echo "📅 昨天: $YESTERDAY"

# 尝试抓取今天的数据
echo ""
echo "🕐 抓取今天的数据..."
RESPONSE_TODAY=$(curl -s -w "\n%{http_code}" "https://wordle-answer-today.vercel.app/api/wordle-scrape?date=$TODAY")
HTTP_CODE_TODAY=$(echo "$RESPONSE_TODAY" | tail -n1)
RESPONSE_BODY_TODAY=$(echo "$RESPONSE_TODAY" | sed '$d')

echo "HTTP状态码: $HTTP_CODE_TODAY"
if [ $HTTP_CODE_TODAY -eq 200 ]; then
    ANSWER_TODAY=$(echo "$RESPONSE_BODY_TODAY" | grep -o '"answer":"[^"]*"' | cut -d'"' -f4 2>/dev/null || echo "解析失败")
    echo "✅ 今天数据抓取成功! 答案: $ANSWER_TODAY"
else
    echo "❌ 今天数据抓取失败"
    echo "响应: $RESPONSE_BODY_TODAY" | head -3
fi

# 尝试抓取昨天的数据（备用）
echo ""
echo "🕐 抓取昨天的数据（备用）..."
RESPONSE_YESTERDAY=$(curl -s -w "\n%{http_code}" "https://wordle-answer-today.vercel.app/api/wordle-scrape?date=$YESTERDAY")
HTTP_CODE_YESTERDAY=$(echo "$RESPONSE_YESTERDAY" | tail -n1)
RESPONSE_BODY_YESTERDAY=$(echo "$RESPONSE_YESTERDAY" | sed '$d')

echo "HTTP状态码: $HTTP_CODE_YESTERDAY"
if [ $HTTP_CODE_YESTERDAY -eq 200 ]; then
    ANSWER_YESTERDAY=$(echo "$RESPONSE_BODY_YESTERDAY" | grep -o '"answer":"[^"]*"' | cut -d'"' -f4 2>/dev/null || echo "解析失败")
    echo "✅ 昨天数据抓取成功! 答案: $ANSWER_YESTERDAY"
else
    echo "❌ 昨天数据抓取失败"
    echo "响应: $RESPONSE_BODY_YESTERDAY" | head -3
fi

echo ""
echo "🔄 检查网站状态..."
sleep 3

# 检查首页是否恢复正常
echo "🌐 访问首页检查..."
HOME_STATUS=$(curl -s -w "%{http_code}" -o /dev/null "https://wordle-answer-today.vercel.app/")
echo "首页状态码: $HOME_STATUS"

if [ $HOME_STATUS -eq 200 ]; then
    echo "✅ 网站首页访问正常"
else
    echo "❌ 网站首页仍有问题"
fi

echo ""
echo "📝 总结:"
echo "- 今天数据: $([ $HTTP_CODE_TODAY -eq 200 ] && echo '✅成功' || echo '❌失败')"
echo "- 昨天数据: $([ $HTTP_CODE_YESTERDAY -eq 200 ] && echo '✅成功' || echo '❌失败')"
echo "- 网站状态: $([ $HOME_STATUS -eq 200 ] && echo '✅正常' || echo '❌异常')"
echo ""
echo "💡 如果数据抓取成功但网站仍有问题，可能需要等待几分钟让静态页面重新生成。"