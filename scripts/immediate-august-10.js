const https = require('https');

// 导入你的Supabase配置
const { getSupabase } = require('../src/lib/supabase');
const { generateHints, generateDifficulty } = require('../src/lib/hint-generator');

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

async function immediateAugust10Update() {
    try {
        const date = '2025-08-10';
        console.log(`立即更新 ${date} 的Wordle答案...`);
        
        const solution = await getWordleSolution(date);
        
        if (solution) {
            console.log(`✅ 成功获取到 ${date} 的Wordle答案：${solution}`);
            
            console.log('正在保存到Supabase数据库...');
            try {
                const supabaseClient = getSupabase();
                if (supabaseClient) {
                    const puzzleNumber = calculatePuzzleNumber(date);
                    const hints = generateHints(solution);
                    const difficulty = generateDifficulty(solution);
                    
                    const { error } = await supabaseClient
                        .from('wordle-answers')
                        .upsert({
                            date: date,
                            puzzle_number: puzzleNumber,
                            answer: solution,
                            hints: hints,
                            difficulty: difficulty,
                            definition: ''
                        }, { onConflict: 'date' });

                    if (error) {
                        throw new Error(`数据库保存错误: ${error.message}`);
                    }
                    
                    console.log(`✅ ${date} 的答案已成功保存到Supabase数据库`);
                    console.log(`🎉 网站已更新，用户可以访问 ${date} 的答案了！`);
                } else {
                    throw new Error('无法获取Supabase客户端');
                }
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