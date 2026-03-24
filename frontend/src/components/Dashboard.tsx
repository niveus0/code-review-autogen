import React from 'react';
import { Card, Statistic, Row, Col, Progress, Tag } from 'antd';

interface DashboardProps {
  totalSubmissions: number;
  openIssues: number;
  resolvedIssues: number;
  avgReviewTime: number;
  severityDistribution: {
    high: number;
    medium: number;
    low: number;
  };
}

const Dashboard: React.FC<DashboardProps> = ({
  totalSubmissions,
  openIssues,
  resolvedIssues,
  avgReviewTime,
  severityDistribution,
}) => {
  const totalIssues = openIssues + resolvedIssues;
  const resolvedPercentage = totalIssues > 0 ? (resolvedIssues / totalIssues) * 100 : 0;

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card>
            <Statistic title="总提交次数" value={totalSubmissions} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="待处理问题" value={openIssues} prefix={<Tag color="red">高</Tag>} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="已解决问题" value={resolvedIssues} prefix={<Tag color="green">低</Tag>} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="平均审查时间" value={avgReviewTime} suffix="秒" />
          </Card>
        </Col>
      </Row>
      
      {/* <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card title="问题解决进度">
            <Progress percent={resolvedPercentage} status="active" />
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between' }}>
              <span>已解决: {resolvedIssues}</span>
              <span>总计: {totalIssues}</span>
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="问题严重程度分布">
            <div style={{ marginBottom: 8 }}>
              <Tag color="red">高</Tag>
              <Progress percent={(severityDistribution.high / totalIssues) * 100} status="active" />
              <span style={{ float: 'right' }}>{severityDistribution.high}</span>
            </div>
            <div style={{ marginBottom: 8 }}>
              <Tag color="orange">中</Tag>
              <Progress percent={(severityDistribution.medium / totalIssues) * 100} status="active" />
              <span style={{ float: 'right' }}>{severityDistribution.medium}</span>
            </div>
            <div>
              <Tag color="blue">低</Tag>
              <Progress percent={(severityDistribution.low / totalIssues) * 100} status="active" />
              <span style={{ float: 'right' }}>{severityDistribution.low}</span>
            </div>
          </Card>
        </Col>
      </Row> */}
    </div>
  );
};

export default Dashboard;