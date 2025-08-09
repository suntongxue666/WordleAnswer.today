import requests

def get_wordle_solution(date_str):
    """
    传入日期字符串（如'2025-07-31'），返回该日Wordle答案
    """
    url = f"https://www.nytimes.com/svc/wordle/v2/{date_str}.json"
    try:
        resp = requests.get(url, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            solution = data.get("solution")
            if solution:
                print(f"{date_str} 的Wordle单词是：{solution.upper()}")
                return solution.upper()
            else:
                print(f"{date_str} 没有查到答案，返回内容：{data}")
                return None
        else:
            print(f"请求失败，状态码：{resp.status_code}")
            return None
    except Exception as e:
        print("请求出错：", e)
        return None

if __name__ == "__main__":
    # 抓取8月10日的答案
    date = "2025-08-10"
    solution = get_wordle_solution(date)
    
    if solution:
        print(f"\n成功获取到 {date} 的Wordle答案：{solution}")
    else:
        print(f"\n未能获取到 {date} 的Wordle答案") 