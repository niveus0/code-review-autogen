# API路由
from fastapi import APIRouter, BackgroundTasks, HTTPException
from pydantic import BaseModel
import uuid
from app.services.review_pipeline import run_review_pipeline
from app.services.database import create_submission, query_review_by_submission, update_submission_status, get_db_connection, get_submission_history, get_dashboard_data

router = APIRouter()

class SubmissionRequest(BaseModel):
    user_id: str
    code_text: str

class ReviewResponse(BaseModel):
    submission_id: str
    status: str
    message: str

@router.post("/submit", response_model=ReviewResponse)
async def submit_code(req: SubmissionRequest, background_tasks: BackgroundTasks):
    """接收代码提交，异步启动审查任务"""
    submission_id = str(uuid.uuid4())
    
    # 记录提交状态
    create_submission(
        id=submission_id,
        user_id=req.user_id,
        code_text=req.code_text,
        status="pending"
    )
    
    # 异步任务
    background_tasks.add_task(run_review_pipeline, submission_id, req.code_text)
    
    return {
        "submission_id": submission_id,
        "status": "pending",
        "message": "审查任务已排队，请稍后查询结果"
    }

@router.get("/review/{submission_id}")
async def get_review(submission_id: str):
    """获取审查结果"""
    review = query_review_by_submission(submission_id)
    if not review:
        # 检查submissions表中的状态
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT status, error_msg FROM submissions WHERE id = ?', (submission_id,))
        row = cursor.fetchone()
        conn.close()
        if row:
            status, error_msg = row
            if status == "failed":
                raise HTTPException(500, f"Review failed: {error_msg}")
            elif status == "processing":
                raise HTTPException(202, "Review is still processing")
            elif status == "pending":
                raise HTTPException(202, "Review is pending")
        raise HTTPException(404, "Review not found or still processing")
    return review

@router.get("/history")
async def get_history(limit: int = 50):
    """获取提交历史记录"""
    return get_submission_history(limit)

@router.get("/dashboard")
async def get_dashboard():
    """获取仪表盘数据"""
    return get_dashboard_data()