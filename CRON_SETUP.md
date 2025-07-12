# 定时任务配置说明

## 解决方案架构
为确保可靠性，使用多层次定时任务：
1. **主要方案**: Vercel Cron（内置，更稳定）
2. **备用方案**: GitHub Actions（免费，多重保障）
3. **应急方案**: 外部cron服务（cron-job.org）

## 1. Vercel Cron（推荐）

### 配置文件：
- `vercel.json` - 定义cron调度
- `src/app/api/cron-scrape/route.ts` - cron处理器

### 调度时间：
**Vercel Cron (主要，免费计划限制2个):**
- 04:03 UTC (00:03 EDT NYC) - 主要抓取时间
- 05:00 UTC (01:00 EDT NYC) - 备用抓取时间

**GitHub Actions (备用):**
- 04:30 UTC (00:30 EDT NYC) - 额外备用
- 07:00 UTC (03:00 EDT NYC) - 最终备用

### 环境变量需求：
```bash
CRON_SECRET=your_secret_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

## 2. GitHub Actions（备用）

### 配置文件：
- `.github/workflows/daily-scrape.yml`

### 特点：
- 与Vercel cron相同的调度时间
- 直接调用API端点
- 无需额外环境变量

## 3. 外部cron服务（应急）

### 使用 cron-job.org：

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

## API更新

### 支持'TODAY'参数：
现在API支持 `date=TODAY` 参数，会自动使用当前日期

### 手动触发 URL：
```bash
# 使用今天日期
curl -X GET "https://wordle-answer-today.vercel.app/api/wordle-scrape?date=TODAY"

# 使用具体日期
curl -X GET "https://wordle-answer-today.vercel.app/api/wordle-scrape?date=2025-07-12"
```

## 监控和日志

### 检查方式：
1. Vercel函数日志
2. GitHub Actions运行记录  
3. Supabase数据库查询
4. 外部cron服务状态页

### 故障排除：
1. 检查环境变量配置
2. 验证目标网站可访问性
3. 查看Crawlee/Playwright执行日志
4. 确认Supabase连接正常

## 时区注意事项
- 美国东部时间 (EDT) = UTC-4 (夏令时，3-11月)
- 美国东部时间 (EST) = UTC-5 (标准时间，11-3月)
- 当前配置基于EDT，冬季需调整