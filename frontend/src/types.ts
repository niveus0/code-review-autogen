// 类型定义文件

// 提交请求类型
export interface SubmissionRequest {
  user_id: string;
  code_text: string;
}

// 审查响应类型
export interface ReviewResponse {
  submission_id: string;
  status: string;
  message: string;
}

// 审查结果类型
export interface ReviewResult {
  review_id: string;
  submission_id: string;
  status: string;
  history: any;
  duration: number;
  created_at: number;
}

// 仪表盘数据类型
export interface DashboardData {
  totalSubmissions: number;
  openIssues: number;
  resolvedIssues: number;
  avgReviewTime: number;
  severityDistribution: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

// 历史记录类型
export interface SubmissionHistory {
  submission_id: string;
  user_id: string;
  status: string;
  created_at: number;
  review_status: string | null;
}

// 问题类型
export interface Issue {
  category: string;
  severity: string;
  file: string;
  line: number;
  message: string;
  suggestion: string;
}