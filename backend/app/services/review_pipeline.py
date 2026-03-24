from autogen import AssistantAgent, UserProxyAgent, GroupChat, GroupChatManager
import json
import time
import tempfile
import os
from autogen import AssistantAgent, UserProxyAgent, GroupChat, GroupChatManager
from app.services.database import update_submission_status, save_review_to_db, update_review_metrics
from app.services.static_analysis import run_radon_analysis, run_bandit_analysis
from app.services.config import llms_config
def setup_agents():
    """设置AutoGen智能体"""
    # Gatekeeper - 前置校验
    gatekeeper = AssistantAgent(
        name="gatekeeper",
        system_message="""你负责审查提交的格式和前置条件：
1. 检查是否包含必需文件（README、LICENSE、.gitignore）
2. 验证代码是否可构建/可运行基础测试
3. 拒绝明显不合规范的提交，给出具体原因""",
        llm_config=llms_config
    )

    # Orchestrator - 工作流编排者
    orchestrator = AssistantAgent(
        name="orchestrator",
        system_message="""你协调多个专业审查Agent：
- 并行启动 quality, security, performance 三个审查
- 等待全部完成后，汇总结果给 writer
- 处理异常和超时，确保整体流程不阻塞""",
        llm_config=llms_config
    )

    # 专业审查 Agents
    quality = AssistantAgent(
        name="quality",
        system_message="""你使用 radon、pylint 等工具分析代码质量：
- 圈复杂度 > 10 标记为"需要简化"
- 重复代码行 > 5 给出提取建议
- 函数长度 > 50 行建议拆分
输出 JSON: {"category":"quality","severity":"...","file":"...","line":...,"message":"...","suggestion":"..."}""",
        llm_config=llms_config
    )

    security = AssistantAgent(
        name="security",
        system_message="""你使用 bandit、safety 进行安全检查：
- SQL注入风险、硬编码密码、不安全的反序列化
- 依赖已知 CVE 的第三方包
输出 JSON 格式同 quality""",
        llm_config=llms_config
    )

    performance = AssistantAgent(
        name="performance",
        system_message="""你分析算法效率和资源使用：
- O(n²) 以上嵌套循环提示优化
- 未使用向量化操作（numpy/pandas）
- 重复 I/O、内存泄漏风险
输出 JSON 格式同 quality""",
        llm_config=llms_config
    )

    # Writer - 报告生成
    writer = AssistantAgent(
        name="writer",
        system_message="""你汇总所有issues，生成易读的报告：
1. 按严重度排序问题列表
2. 给出整体评分(0-5分)和一句话总结
3. 提供优先级修复建议（本周、本月、长期）
输出为 Markdown 格式报告""",
        llm_config=llms_config
    )

    # UserProxy - 代表用户触发流程
    user = UserProxyAgent(
        name="user",
        human_input_mode="NEVER",
        max_consecutive_auto_reply=0,
        code_execution_config=False
    )

    # 创建群聊
    groupchat = GroupChat(
        agents=[user, gatekeeper, orchestrator, quality, security, performance, writer],
        messages=[],
        max_round=20,
        speaker_selection_method="round_robin"
    )

    manager = GroupChatManager(
        groupchat=groupchat,
        llm_config=llms_config
    )

    return {
        "user": user,
        "manager": manager,
        "groupchat": groupchat,
        "gatekeeper": gatekeeper,
        "orchestrator": orchestrator,
        "quality": quality,
        "security": security,
        "performance": performance,
        "writer": writer
    }

def run_review_pipeline(submission_id: str, code_text: str):
    """运行代码审查流水线"""
    update_submission_status(submission_id, "processing")
    start_time = time.time()

    try:
        # 1. 保存代码到临时文件
        with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
            f.write(code_text)
            temp_file_path = f.name

        # 2. 运行静态分析
        try:
            complexity_issues = run_radon_analysis(temp_file_path)
        except Exception as e:
            print(f"Warning: Radon analysis failed: {e}")
            complexity_issues = []

        try:
            security_issues = run_bandit_analysis(temp_file_path)
        except Exception as e:
            print(f"Warning: Bandit analysis failed: {e}")
            security_issues = []

        # 3. 准备agents
        agents = setup_agents()
        user = agents["user"]
        manager = agents["manager"]
        groupchat = agents["groupchat"]

        # 4. 发起对话
        # 检测代码类型
        is_python_code = code_text.strip().startswith(('import ', 'from ', 'def ', 'class ', 'if __name__')) or '.py' in temp_file_path

        prompt = f"""请审查以下代码：

{code_text}

代码类型: {'Python' if is_python_code else '非Python代码'}

静态分析结果：
- 复杂度问题：{json.dumps(complexity_issues, indent=2)}
- 安全问题：{json.dumps(security_issues, indent=2)}

请按以下步骤进行审查：
1. Gatekeeper先进行前置校验
2. Orchestrator协调专业审查
3. Writer生成最终报告

注意：如果这不是Python代码，请专注于代码的逻辑正确性、可读性和潜在问题。"""

        user.initiate_chat(manager, message=prompt)

        # 5. 提取chat history并处理结果
        chat_history = groupchat.messages

        # 6. 提取各agent的输出
        issues = []
        report = ""

        for msg in chat_history:
            if msg.get("role") == "assistant":
                sender_name = msg.get("name", "")
                content = msg.get("content", "")

                # 提取专业审查agents的issues
                if sender_name in ["quality", "security", "performance"]:
                    try:
                        agent_issues = json.loads(content)
                        if isinstance(agent_issues, list):
                            issues.extend(agent_issues)
                        elif isinstance(agent_issues, dict):
                            issues.append(agent_issues)
                    except json.JSONDecodeError:
                        # 如果不是JSON格式，跳过
                        pass

                # 提取writer的报告
                elif sender_name == "writer":
                    report = content

        # 7. 保存结果到数据库
        review_id = save_review_to_db(submission_id, {
            "issues": issues,
            "report": report,
            "chat_history": chat_history
        })

        duration = int((time.time() - start_time) * 1000)
        update_review_metrics(review_id, duration)
        update_submission_status(submission_id, "completed")

        # 8. 清理临时文件
        if os.path.exists(temp_file_path):
            os.unlink(temp_file_path)

    except Exception as e:
        update_submission_status(submission_id, "failed", error_msg=str(e))
        # 清理临时文件
        if 'temp_file_path' in locals() and os.path.exists(temp_file_path):
            os.unlink(temp_file_path)