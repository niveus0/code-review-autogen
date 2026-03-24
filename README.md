# 代码审查自动生成系统

一个综合性的代码审查系统，使用AI自动分析代码提交并提供详细反馈。

## 项目概述

代码审查自动生成系统是一个基于Web的应用程序，旨在通过提供自动化的代码审查帮助开发人员提高代码质量。该系统使用静态分析工具和AI模型来识别潜在问题，提出改进建议，并生成全面的审查报告。

### 主要功能
- **自动化代码分析**：使用静态分析工具检测常见的编码问题
- **AI驱动的审查**：利用LLM模型提供智能代码反馈
- **实时进度跟踪**：实时监控代码审查进度
- **详细审查报告**：生成包含已识别问题和建议的综合报告
- **历史管理**：存储以前的代码审查以供参考

## 项目结构

```
├── backend/                # 后端API服务器
│   ├── app/                # 应用程序代码
│   │   ├── api/            # API路由
│   │   └── services/       # 核心服务（分析、审查管道）
│   ├── main.py             # FastAPI应用入口点
│   └── requirements.txt    # Python依赖项
├── frontend/               # React前端
│   ├── public/             # 静态资产
│   └── src/                # 源代码
│       ├── components/     # UI组件
│       ├── pages/          # 应用程序页面
│       ├── services/       # API服务
│       └── utils/          # 实用函数
└── README.md               # 项目文档
```

## 设置说明

### 先决条件
- Python 3.8+
- Node.js 16+
- npm或yarn

### 后端设置
1. 导航到后端目录：
   ```bash
   cd backend
   ```

2. 安装依赖项：
   ```bash
   pip install -r requirements.txt
   ```

3. 创建一个`.env`文件，包含您的API密钥：
   ```
   API_KEY=your_openai_api_key
   BASE_URL=https://api.openai.com/v1
   ```

4. 启动后端服务器：
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

### 前端设置
1. 导航到前端目录：
   ```bash
   cd frontend
   ```

2. 安装依赖项：
   ```bash
   npm install
   ```

3. 启动前端开发服务器：
   ```bash
   npm start
   ```

应用程序将在`http://localhost:3000`上可用。

## API端点

### POST /submit
提交代码进行审查
- **请求体**：
  ```json
  {
    "code": "string",
    "language": "string",
    "description": "string"
  }
  ```
- **响应**：
  ```json
  {
    "submission_id": "string",
    "status": "pending"
  }
  ```

### GET /review/{submission_id}
获取审查状态和结果
- **响应**：
  ```json
  {
    "submission_id": "string",
    "status": "completed",
    "review": {
      "issues": [...],
      "suggestions": [...],
      "score": "number"
    }
  }
  ```

### GET /history
获取代码提交历史
- **响应**：
  ```json
  [
    {
      "submission_id": "string",
      "language": "string",
      "submitted_at": "string",
      "status": "string"
    }
  ]
  ```

### GET /dashboard
获取仪表板统计信息
- **响应**：
  ```json
  {
    "total_submissions": "number",
    "completed_reviews": "number",
    "average_score": "number"
  }
  ```

## 使用的技术

### 后端
- **FastAPI**：用于构建API的现代Python Web框架
- **SQLite**：用于存储提交和审查的轻量级数据库
- **OpenAI API**：用于AI驱动的代码审查
- **静态分析工具**：用于检测常见的编码问题

### 前端
- **React**：用于构建用户界面的JavaScript库
- **TypeScript**：JavaScript的类型化超集
- **Ant Design**：UI组件库
- **Axios**：用于API请求的HTTP客户端

## 贡献

欢迎贡献！请随时提交Pull Request。

### 开发工作流程
1. Fork仓库
2. 为您的功能创建一个新分支
3. 进行更改
4. 测试您的更改
5. 提交Pull Request

## 许可证

本项目使用MIT许可证 - 有关详细信息，请参阅LICENSE文件。

## 致谢

- OpenAI提供用于代码审查的AI模型
- FastAPI作为后端框架
- React和Ant Design作为前端UI