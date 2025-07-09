# 定时任务配置说明

## 使用 cron-job.org 或类似服务

### 设置步骤：
1. 访问 https://cron-job.org 注册账号
2. 创建 3 个定时任务：

**任务 1：**
- 名称: Wordle Scraper 00:03 ET
- URL: https://wordle-answer-today.vercel.app/api/wordle-scrape?date=TODAY
- 时间: 每天 04:03 UTC (00:03 ET)
- 方法: GET

**任务 2：**
- 名称: Wordle Scraper 00:29 ET  
- URL: https://wordle-answer-today.vercel.app/api/wordle-scrape?date=TODAY
- 时间: 每天 04:29 UTC (00:29 ET)
- 方法: GET

**任务 3：**
- 名称: Wordle Scraper 01:01 ET
- URL: https://wordle-answer-today.vercel.app/api/wordle-scrape?date=TODAY
- 时间: 每天 05:01 UTC (01:01 ET)
- 方法: GET

### 高级设置：
- 超时时间: 30 秒
- 重试次数: 2
- 失败通知: 启用邮件通知
- User-Agent: WordleBot/1.0

### 时区注意事项：
- 美国东部时间 (ET) = UTC-5 (标准时间) 或 UTC-4 (夏令时)
- 当前使用 UTC 时间，需要根据季节调整

### 手动触发 URL：
```bash
curl -X GET "https://wordle-answer-today.vercel.app/api/wordle-scrape?date=2025-07-08"
```

### 监控和日志：
- 定期检查任务执行状态
- 监控 API 响应时间
- 查看数据库数据完整性