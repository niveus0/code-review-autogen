import React from 'react';
import { List, Tag, Badge, Empty } from 'antd';
import ReviewCard from './ReviewCard.tsx';

interface Issue {
  id: string;
  title: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  location: string;
  suggestion: string;
}

interface IssueListProps {
  issues: Issue[];
}

const IssueList: React.FC<IssueListProps> = ({ issues }) => {
  if (issues.length === 0) {
    return <Empty description="未发现问题" />;
  }

  return (
    <List
      itemLayout="vertical"
      dataSource={issues}
      renderItem={(issue) => (
        <List.Item>
          <ReviewCard
            title={issue.title}
            severity={issue.severity}
            description={issue.description}
            location={issue.location}
            suggestion={issue.suggestion}
          />
        </List.Item>
      )}
    />
  );
};

export default IssueList;