# Code Review Backend

基于AutoGen的多智能体代码审查系统，支持质量、安全、性能等多维度自动分析。

## 项目结构

```
backend/
├── app/
│   ├── services/
│   │   ├── database.py         # SQLite数据库操作
│   │   ├── review_pipeline.py  # AutoGen智能体审查流水线
│   │   └── static_analysis.py  # 静态分析工具集成
│   └── __init__.py
├── main.py                     # FastAPI应用入口
├── requirements.txt            # 项目依赖
├── start.sh                    # 启动脚本
├── .env                        # 环境变量配置
└── code_review.db              # SQLite数据库文件
```

## 智能体架构

### 审查流程
1. **Gatekeeper**: 前置校验（必需文件、构建测试）
2. **Orchestrator**: 工作流编排者，协调专业审查
3. **Quality Agent**: 代码质量分析（复杂度、重复代码、函数长度）
4. **Security Agent**: 安全漏洞检查（SQL注入、硬编码密码等）
5. **Performance Agent**: 性能优化建议（算法复杂度、资源使用）
6. **Writer Agent**: 生成结构化审查报告

### 数据存储
- 使用SQLite本地数据库存储提交记录和审查结果
- 支持完整的CRUD操作和历史查询

## 安装依赖

```bash
pip install -r requirements.txt
```

**注意**: 当前使用SQLite本地数据库，无需额外数据库配置。

## 运行应用

### 启动后端服务

```bash
python main.py
```

或使用启动脚本：

```bash
./start.sh
```

服务将在 `http://localhost:8000` 启动。

### API接口

- `POST /api/v1/submit`: 提交代码审查请求
- `GET /api/v1/review/{submission_id}`: 获取审查结果

### 请求示例

```bash
curl -X POST "http://localhost:8000/api/v1/submit" \
     -H "Content-Type: application/json" \
     -d '{
       "user_id": "test_user",
       "code_text": "def hello():\n    print(\"Hello, World!\")",
     }'
```

## 审查流程说明

1. 代码提交后，系统自动创建审查任务
2. Gatekeeper进行前置校验
3. Orchestrator协调Quality、Security、Performance三个专业Agent并行审查
4. Writer汇总所有发现的问题，生成Markdown格式的审查报告
5. 结果存储在本地SQLite数据库中，可通过API查询

## 依赖工具

- **radon**: 代码复杂度分析
- **bandit**: Python安全漏洞扫描
- **AutoGen**: 多智能体协作框架
- **FastAPI**: 现代Python Web框架
DB_PASSWORD=postgres
DB_PORT=5432

# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

```

## 启动服务

```bash
# 方法1：直接运行启动脚本
./start.sh

# 方法2：手动启动
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## API接口

### 1. 提交代码审查

**POST /api/v1/submit**

请求体：
```json
{
  "user_id": "user123",
  "code_text": "def hello():\n    print('Hello World')"
}
```

响应：
```json
{
  "submission_id": "uuid",
  "status": "pending",
  "message": "审查任务已排队，请稍后查询结果"
}
```

### 2. 获取审查结果

**GET /api/v1/review/{submission_id}**

响应：
```json
{
  "review_id": "uuid",
  "submission_id": "uuid",
  "status": "completed",
  "history": [...],
  "created_at": 1234567890
}
```