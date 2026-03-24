import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Typography, Divider, Button, Spin, Alert } from 'antd';
import SubmissionForm from '../components/SubmissionForm.tsx';
import Dashboard from '../components/Dashboard.tsx';
import { getDashboardData } from '../services/api.ts';

const { Header, Content } = Layout;
const { Title } = Typography;

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState({
    totalSubmissions: 0,
    openIssues: 0,
    resolvedIssues: 0,
    avgReviewTime: 0,
    severityDistribution: {
      high: 0,
      medium: 0,
      low: 0,
    },
  });
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const data = await getDashboardData();
        setDashboardData(data);
      } catch (err) {
        setError('获取仪表盘数据失败，请重试');
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={3} style={{ margin: '16px 0' }}>代码审查系统</Title>
        <Button type="primary" onClick={() => navigate('/history')}>查看历史记录</Button>
      </Header>
      <Content style={{ padding: '24px' }}>
        <Title level={4}>提交代码审查</Title>
        <SubmissionForm />
        <Divider />
        <Title level={4}>系统仪表盘</Title>
        {loading ? (
          <Spin size="large" />
        ) : error ? (
          <Alert message={error} type="error" />
        ) : (
          <Dashboard {...dashboardData} />
        )}
      </Content>
    </Layout>
  );
};

export default Home;