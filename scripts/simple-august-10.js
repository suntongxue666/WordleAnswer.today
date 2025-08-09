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
        const supabaseUrl = 'https://yubvrpzgvixulyylqfkp.supabase.co';
        const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1YnZycHpndml4dWx5eWxxZmtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NjQ5ODAsImV4cCI6MjA2NzM0MDk4MH0.yLB0DgETfVOiZLyZT3W_mVliR6lMOhpzXPzuX5ByKmM';
        
        const puzzleNumber = calculatePuzzleNumber(date);
        
        // 构建请求数据
        const postData = JSON.stringify({
            date: date,
            puzzle_number: puzzleNumber,
            answer: solution,
            hints: [], // 暂时留空
            difficulty: 'medium', // 暂时设为中等
            definition: ''
        });

        console.log('发送到Supabase的数据:', postData);

        // 使用PATCH方法来更新现有记录
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
                console.log('Supabase响应状态码:', res.statusCode);
                console.log('Supabase响应头:', res.headers);
                
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });
                res.on('end', () => {
                    console.log('Supabase响应体:', data);
                    console.log('响应体长度:', data.length);
                    
                    try {
                        if (res.statusCode >= 200 && res.statusCode < 300) {
                            if (data && data.trim()) {
                                resolve({ success: true, data: JSON.parse(data) });
                            } else {
                                resolve({ success: true, data: null });
                            }
                        } else {
                            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                        }
                    } catch (error) {
                        console.log('JSON解析错误:', error);
                        if (res.statusCode >= 200 && res.statusCode < 300) {
                            // 如果状态码是成功的，即使没有JSON响应也认为是成功的
                            resolve({ success: true, data: null });
                        } else {
                            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                        }
                    }
                });
            });

            req.on('error', (error) => {
                console.log('请求错误:', error);
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