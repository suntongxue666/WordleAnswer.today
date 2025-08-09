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

async function main() {
    try {
        const date = '2025-08-09';  // 改为8月9日
        const solution = await getWordleSolution(date);
        
        if (solution) {
            console.log(`\n成功获取到 ${date} 的Wordle答案：${solution}`);
        } else {
            console.log(`\n未能获取到 ${date} 的Wordle答案`);
        }
    } catch (error) {
        console.log('程序执行出错：', error);
    }
}

main(); 