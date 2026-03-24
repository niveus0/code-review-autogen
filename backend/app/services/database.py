import sqlite3
import time
import uuid
import os
import sqlite3

# 数据库文件路径
DB_PATH = os.path.join(os.path.dirname(__file__), '..', '..', 'code_review.db')

def get_db_connection():
    """获取数据库连接"""
    return sqlite3.connect(DB_PATH)

def init_db():
    """初始化数据库表"""
    conn = get_db_connection()
    cursor = conn.cursor()

    # 创建submissions表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS submissions (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            code_text TEXT NOT NULL,
            status TEXT NOT NULL,
            error_msg TEXT,
            created_at REAL NOT NULL
        )
    ''')

    # 创建reviews表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS reviews (
            review_id TEXT PRIMARY KEY,
            submission_id TEXT NOT NULL,
            status TEXT NOT NULL,
            history TEXT NOT NULL,
            duration INTEGER,
            created_at REAL NOT NULL,
            FOREIGN KEY (submission_id) REFERENCES submissions (id)
        )
    ''')

    conn.commit()
    conn.close()

# 初始化数据库
init_db()

def create_submission(id: str, user_id: str, code_text: str, status: str):
    """创建代码提交记录"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO submissions (id, user_id, code_text, status, created_at)
        VALUES (?, ?, ?, ?, ?)
    ''', (id, user_id, code_text, status, time.time()))
    conn.commit()
    conn.close()

def update_submission_status(id: str, status: str, error_msg: str = None):
    """更新提交状态"""
    conn = get_db_connection()
    cursor = conn.cursor()
    if error_msg:
        cursor.execute('''
            UPDATE submissions SET status = ?, error_msg = ? WHERE id = ?
        ''', (status, error_msg, id))
    else:
        cursor.execute('''
            UPDATE submissions SET status = ? WHERE id = ?
        ''', (status, id))
    conn.commit()
    conn.close()

def query_review_by_submission(submission_id: str):
    """根据提交ID查询审查结果"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM reviews WHERE submission_id = ?', (submission_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return {
            'review_id': row[0],
            'submission_id': row[1],
            'status': row[2],
            'history': row[3],
            'duration': row[4],
            'created_at': row[5]
        }
    return None

def save_review_to_db(submission_id: str, history):
    """保存审查结果到数据库"""
    review_id = str(uuid.uuid4())
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO reviews (review_id, submission_id, status, history, created_at)
        VALUES (?, ?, ?, ?, ?)
    ''', (review_id, submission_id, 'completed', str(history), time.time()))
    conn.commit()
    conn.close()
    return review_id

def update_review_metrics(review_id: str, duration: int):
    """更新审查指标"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE reviews SET duration = ? WHERE review_id = ?
    ''', (duration, review_id))
    conn.commit()
    conn.close()

def get_submission_history(limit: int = 50):
    """获取提交历史记录"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT s.id, s.user_id, s.status, s.created_at, r.status as review_status
        FROM submissions s
        LEFT JOIN reviews r ON s.id = r.submission_id
        ORDER BY s.created_at DESC
        LIMIT ?
    ''', (limit,))
    rows = cursor.fetchall()
    conn.close()
    return [{
        'submission_id': row[0],
        'user_id': row[1],
        'status': row[2],
        'created_at': row[3],
        'review_status': row[4]
    } for row in rows]

def get_dashboard_data():
    """获取仪表盘数据"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 总提交数
    cursor.execute('SELECT COUNT(*) FROM submissions')
    total_submissions = cursor.fetchone()[0]
    
    # 已完成的审查数
    cursor.execute('SELECT COUNT(*) FROM reviews WHERE status = "completed"')
    completed_reviews = cursor.fetchone()[0]
    
    # 平均审查时间
    cursor.execute('SELECT AVG(duration) FROM reviews WHERE duration IS NOT NULL')
    avg_review_time = cursor.fetchone()[0]
    if avg_review_time is None:
        avg_review_time = 0
    else:
        avg_review_time = round(avg_review_time)
    
    # 计算问题数量（这里需要根据实际的history字段结构来解析，暂时返回0）
    open_issues = 0
    resolved_issues = 0
    
    # 严重程度分布（暂时返回模拟数据）
    severity_distribution = {
        'high': 0,
        'medium': 0,
        'low': 0
    }
    
    conn.close()
    
    return {
        'totalSubmissions': total_submissions,
        'openIssues': open_issues,
        'resolvedIssues': resolved_issues,
        'avgReviewTime': avg_review_time,
        'severityDistribution': severity_distribution
    }