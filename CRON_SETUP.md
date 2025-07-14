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
**Vercel Cron (1个任务，账户限制):**
- 05:01 UTC (01:01 EDT NYC) - 主要抓取时间，优化为NYT review页面发布后

**GitHub Actions (3个任务，承担主要责任):**
- 05:01 UTC (01:01 EDT NYC) - 主要备用 (1分钟后)
- 05:15 UTC (01:15 EDT NYC) - 次要备用
- 05:30 UTC (01:30 EDT NYC) - 最终备用

⚠️ **说明**: 抓取时间调整为美东时间01:01，确保NYT review页面已发布

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

### 新的抓取策略：
1. **主要来源**: NYT review页面 (`https://www.nytimes.com/YYYY/MM/DD/crosswords/wordle-review-XXXX.html`)
2. **备用来源**: NYT游戏页面 (`https://www.nytimes.com/games/wordle/index.html`)
3. **最终备用**: wordlehint.top

### 关键改进：
- **智能hints生成**: 根据答案自动生成多种类型的提示，不再依赖第三方网站
- **难度自动评估**: 基于字母组合、元音数量、常用词等因素自动评估难度
- **多重抓取策略**: 优先从NYT官方review页面获取答案，确保准确性
- **更准确的期数计算**: 基于已知的基准日期自动计算puzzle number

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