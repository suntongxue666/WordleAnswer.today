const https = require('https');

function getWordleSolution(dateStr) {
    return new Promise((resolve, reject) => {
        const url = `https://www.nytimes.com/svc/wordle/v2/${dateStr}.json`;

        https.get(url, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    if (res.statusCode === 200) {
                        const jsonData = JSON.parse(data);
                        const solution = jsonData.solution;

                        if (solution) {
                            console.log(`${dateStr} 的Wordle单词是：${solution.toUpperCase()}`);
                            resolve(solution.toUpperCase());
                        } else {
                            console.log(`${dateStr} 没有查到答案，返回内容：`, jsonData);
                            resolve(null);
                        }
                    } else {
                        console.log(`请求失败，状态码：${res.statusCode}`);
                        resolve(null);
                    }
                } catch (error) {
                    console.log('解析响应数据出错：', error);
                    resolve(null);
                }
            });
        }).on('error', (error) => {
            console.log('请求出错：', error);
            reject(error);
        });
    });
}

function calculatePuzzleNumber(dateStr) {
    const targetDate = new Date(dateStr);
    const baseDate = new Date('2025-07-07');
    const basePuzzleNumber = 1479;
    const diffTime = targetDate.getTime() - baseDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return basePuzzleNumber + diffDays;
}

async function saveToSupabase(date, solution) {
    try {
        const supabaseUrl = 'https://yubvrpzgvixulyylqfkp.supabase.co';
        const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1YnZycHpndml4dWx5eWxxZmtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NjQ5ODAsImV4cCI6MjA2NzM0MDk4MH0.yLB0DgETfVOiZLyZT3W_mVliR6lMOhpzXPzuX5ByKmM';

        const puzzleNumber = calculatePuzzleNumber(date);

        const postData = JSON.stringify({
            date: date,
            puzzle_number: puzzleNumber,
            answer: solution,
            hints: [],
            difficulty: 'medium',
            definition: ''
        });

        console.log(`发送到Supabase的数据: ${postData}`);

        const options = {
            hostname: 'yubvrpzgvixulyylqfkp.supabase.co',
            port: 443,
            path: `/rest/v1/wordle-answers?date=eq.${date}`,
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${supabaseKey}`,
                'apikey': supabaseKey
            }
        };

        return new Promise((resolve, reject) => {
            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });
                res.on('end', () => {
                    try {
                        if (res.statusCode >= 200 && res.statusCode < 300) {
                            resolve({ success: true, data: data ? JSON.parse(data) : null });
                        } else {
                            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                        }
                    } catch (error) {
                        if (res.statusCode >= 200 && res.statusCode < 300) {
                            resolve({ success: true, data: null });
                        } else {
                            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                        }
                    }
                });
            });

            req.on('error', (error) => {
                reject(error);
            });

            req.write(postData);
            req.end();
        });
    } catch (error) {
        throw error;
    }
}

async function updateNextDayWordle() {
    try {
        // 获取明天的日期
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];

        console.log(`开始更新 ${tomorrowStr} 的Wordle答案...`);

        const solution = await getWordleSolution(tomorrowStr);

        if (solution) {
            console.log(`✅ 成功获取到 ${tomorrowStr} 的Wordle答案：${solution}`);

            console.log('正在保存到Supabase数据库...');
            try {
                const result = await saveToSupabase(tomorrowStr, solution);
                console.log(`✅ ${tomorrowStr} 的答案已成功保存到Supabase数据库`);
                console.log(` 网站已更新，用户可以访问 ${tomorrowStr} 的答案了！`);
            } catch (dbError) {
                console.log(`❌ 保存到数据库失败:`, dbError.message);
            }
        } else {
            console.log(`❌ 未能获取到 ${tomorrowStr} 的Wordle答案`);
        }
    } catch (error) {
        console.log('程序执行出错：', error);
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    updateNextDayWordle();
}

module.exports = { updateNextDayWordle };