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

// 计算puzzle number
function calculatePuzzleNumber(dateStr) {
    const targetDate = new Date(dateStr);
    const baseDate = new Date('2025-07-07');
    const basePuzzleNumber = 1479;
    const diffTime = targetDate.getTime() - baseDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return basePuzzleNumber + diffDays;
}

// 直接保存到Supabase
async function saveToSupabase(date, solution) {
    try {
        // 这里需要你的Supabase配置
        // 你可以从环境变量或者配置文件中读取
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        
        if (!supabaseUrl || !supabaseKey) {
            throw new Error('缺少Supabase配置，请设置环境变量');
        }
        
        const puzzleNumber = calculatePuzzleNumber(date);
        
        // 构建请求数据
        const postData = JSON.stringify({
            date: date,
            puzzle_number: puzzleNumber,
            answer: solution,
            hints: [], // 这里可以生成提示，暂时留空
            difficulty: 'medium', // 暂时设为中等
            definition: ''
        });

        const options = {
            hostname: new URL(supabaseUrl).hostname,
            port: 443,
            path: '/rest/v1/wordle-answers',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${supabaseKey}`,
                'apikey': supabaseKey,
                'Prefer': 'resolution=merge-duplicates'
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
                            resolve({ success: true, data: JSON.parse(data) });
                        } else {
                            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                        }
                    } catch (error) {
                        reject(error);
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

async function immediateAugust10Update() {
    try {
        const date = '2025-08-10';
        console.log(`立即更新 ${date} 的Wordle答案...`);
        
        const solution = await getWordleSolution(date);
        
        if (solution) {
            console.log(`✅ 成功获取到 ${date} 的Wordle答案：${solution}`);
            
            console.log('正在保存到Supabase数据库...');
            try {
                const result = await saveToSupabase(date, solution);
                console.log(`✅ ${date} 的答案已成功保存到Supabase数据库`);
                console.log(`🎉 网站已更新，用户可以访问 ${date} 的答案了！`);
            } catch (dbError) {
                console.log(`❌ 保存到数据库失败:`, dbError.message);
                console.log('请检查Supabase配置和环境变量');
            }
        } else {
            console.log(`❌ 未能获取到 ${date} 的Wordle答案`);
        }
    } catch (error) {
        console.log('程序执行出错：', error);
    }
}

// 立即执行
immediateAugust10Update();