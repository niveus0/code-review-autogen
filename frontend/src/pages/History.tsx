import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Typography, Table, Button, Spin, Alert } from 'antd';
import { getSubmissionHistory } from '../services/api.ts';

const { Header, Content } = Layout;
const { Title } = Typography;

const History: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);

  useEffect(() => {
    const fetchSubmissionHistory = async () => {
      setLoading(true);
      try {
        const data = await getSubmissionHistory();
        setSubmissions(data);
      } catch (err) {
        setError('获取历史记录失败，请重试');
        console.error('Error fetching submission history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissionHistory();
  }, []);

  const columns = [
    {
      title: 'ID',
      dataIndex: 'submission_id',
      key: 'submission_id',
    },
    {
      title: '提交时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text: string) => new Date(text).toLocaleString(),
    },
    {
      title: '提交状态',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: '审查状态',
      dataIndex: 'review_status',
      key: 'review_status',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Button type="link" onClick={() => navigate(`/submission/${record.submission_id}`)}>
          查看详情
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Header style={{ background: '#fff', padding: '0 24px' }}>
          <Title level={3} style={{ margin: '16px 0' }}>代码审查系统</Title>
        </Header>
        <Content style={{ padding: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Spin size="large" />
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
        <Title level={4}>提交历史</Title>
        <Table columns={columns} dataSource={submissions} rowKey="submission_id" />
        <Button type="primary" onClick={() => navigate('/')} style={{ marginTop: 24 }}>
          返回首页
        </Button>
      </Content>
    </Layout>
  );
};

export default History;