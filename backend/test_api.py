import requests
import json

# 测试提交代码
def test_submit_code():
    url = "http://localhost:8000/submit"
    data = {
        "user_id": "test_user",
        "code_text": "print('Hello World')"
    }
    response = requests.post(url, json=data)
    print("Submit response:")
    print(response.status_code)
    print(response.json())
    return response.json().get("submission_id")

# 测试获取审查结果
def test_get_review(submission_id):
    url = f"http://localhost:8000/review/{submission_id}"
    response = requests.get(url)
    print(f"\nGet review response for {submission_id}:")
    print(response.status_code)
    print(response.text)

if __name__ == "__main__":
    submission_id = test_submit_code()
    # 等待几秒钟让后台任务处理
    import time
    time.sleep(5)
    test_get_review(submission_id)