import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout, Typography, Spin, Alert, Button, Progress } from 'antd';
import { getSubmissionDetail } from '../services/api.ts';
import IssueList from '../components/IssueList.tsx';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

const SubmissionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submission, setSubmission] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const [isPolling, setIsPolling] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let progressValue = 0;

    const fetchSubmissionDetail = async () => {
      if (!id) return;
      try {
        const data = await getSubmissionDetail(id);
        
        // 检查是否获取到完整的审查结果
        if (data.status === 'completed') {
          setSubmission(data);
          setProgress(100);
          setIsPolling(false);
          clearInterval(interval);
          setLoading(false);
        } else if (data.status === 'failed') {
          setError('审查失败，请重试');
          setIsPolling(false);
          clearInterval(interval);
          setLoading(false);
        } else {
          // 审查仍在进行中，继续轮询
          progressValue = Math.min(progressValue + 10, 90);
          setProgress(progressValue);
        }
      } catch (err) {
        setError('获取审查结果失败，请重试');
        console.error('Error fetching submission detail:', err);
        setIsPolling(false);
        clearInterval(interval);
        setLoading(false);
      }
    };

    // 初始加载
    setLoading(true);
    fetchSubmissionDetail();

    // 设置轮询
    interval = setInterval(fetchSubmissionDetail, 2000);

    // 清理函数
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [id]);

  if (loading) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Header style={{ background: '#fff', padding: '0 24px' }}>
          <Title level={3} style={{ margin: '16px 0' }}>代码审查系统</Title>
        </Header>
        <Content style={{ padding: '24px' }}>
          <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <Title level={4}>正在获取审查结果</Title>
            <p>审查正在进行中，请稍候...</p>
            <Progress percent={progress} status="active" style={{ margin: '24px 0' }} />
            <Spin size="small" style={{ display: 'block', margin: '0 auto' }} />
          </div>
        </Content>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Header style={{ background: '#fff', padding: '0 24px' }}>
          <Title level={3} style={{ margin: '16px 0' }}>代码审查系统</Title>
        </Header>
        <Content style={{ padding: '24px' }}>
          <Alert message={error} type="error" />
          <Button type="primary" onClick={() => navigate('/')} style={{ marginTop: 16 }}>
            返回首页
          </Button>
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#fff', padding: '0 24px' }}>
        <Title level={3} style={{ margin: '16px 0' }}>代码审查系统</Title>
      </Header>
      <Content style={{ padding: '24px' }}>
        <div style={{ marginBottom: 24 }}>
          <Title level={4}>审查结果详情</Title>
          <Text strong>提交ID:</Text> {submission.submission_id || submission.review_id} <br />
          <Text strong>审查时间:</Text> {submission.created_at ? new Date(submission.created_at * 1000).toLocaleString() : '未知'} <br />
          <Text strong>审查状态:</Text> {submission.status} <br />
          {submission.duration && (
            <>
              <Text strong>处理时长:</Text> {Math.round(submission.duration / 1000)}秒 <br />
            </>
          )}
        </div>
        
        <div style={{ marginBottom: 24 }}>
          <Title level={5}>审查历史</Title>
          {submission.history && (
            <pre style={{ background: '#f5f5f5', padding: 16, borderRadius: 4, overflow: 'auto', maxHeight: '400px' }}>
              {typeof submission.history === 'string' ? submission.history : JSON.stringify(submission.history, null, 2)}
            </pre>
          )}
        </div>
        
        <Button type="primary" onClick={() => navigate('/')} style={{ marginTop: 24 }}>
          返回首页
        </Button>
      </Content>
    </Layout>
  );
};

export default SubmissionDetail;