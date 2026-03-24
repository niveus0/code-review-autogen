import subprocess
import tempfile
import os
from pathlib import Path

def run_radon_analysis(file_path: str):
    """使用 radon 计算复杂度"""
    try:
        result = subprocess.run(
            ["radon", "cc", file_path, "-s", "-a"],
            capture_output=True, text=True,
            timeout=30  # 添加超时
        )
        # 解析输出，提取复杂度超标文件
        issues = []
        for line in result.stdout.splitlines():
            if "C" in line and len(line.split()) > 1:
                try:
                    complexity = float(line.split()[1])
                    if complexity > 10:
                        issues.append({
                            "file": file_path,
                            "complexity": complexity,
                            "severity": "medium"
                        })
                except ValueError:
                    pass
        return issues
    except (subprocess.CalledProcessError, FileNotFoundError, subprocess.TimeoutExpired):
        # 如果radon不可用或执行失败，返回空列表
        return []

def run_bandit_analysis(file_path: str):
    """使用 bandit 进行安全分析"""
    try:
        result = subprocess.run(
            ["bandit", "-f", "json", file_path],
            capture_output=True, text=True,
            timeout=30  # 添加超时
        )
        # 解析输出，提取安全问题
        issues = []
        try:
            import json
            bandit_result = json.loads(result.stdout)
            for issue in bandit_result.get("results", []):
                issues.append({
                    "file": issue.get("filename"),
                    "line": issue.get("line_number"),
                    "code": issue.get("code"),
                    "issue": issue.get("issue_text"),
                    "severity": issue.get("severity"),
                    "confidence": issue.get("confidence")
                })
        except json.JSONDecodeError:
            pass
        return issues
    except (subprocess.CalledProcessError, FileNotFoundError, subprocess.TimeoutExpired):
        # 如果bandit不可用或执行失败，返回空列表
        return []