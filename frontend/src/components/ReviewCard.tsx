import React from 'react';
import { Card, Tag, Badge, Descriptions } from 'antd';

interface ReviewCardProps {
  title: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  location: string;
  suggestion: string;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
  title,
  severity,
  description,
  location,
  suggestion,
}) => {
  const getSeverityColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'red';
      case 'medium':
        return 'orange';
      case 'low':
      default:
        return 'blue';
    }
  };

  return (
    <Card
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {title}
          <Badge status={getSeverityColor(severity) as any} text={severity} />
        </div>
      }
      style={{ marginBottom: 16 }}
    >
      <Descriptions bordered size="small">
        <Descriptions.Item label="描述">{description}</Descriptions.Item>
        <Descriptions.Item label="位置">{location}</Descriptions.Item>
        <Descriptions.Item label="建议" span={2}>{suggestion}</Descriptions.Item>
      </Descriptions>
    </Card>
  );
};

export default ReviewCard;