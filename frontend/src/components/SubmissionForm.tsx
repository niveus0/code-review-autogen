import React, { useState } from 'react';
import { Form, Input, Select, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { submitCodeReview } from '../services/api.ts';

const { TextArea } = Input;
const { Option } = Select;

const SubmissionForm: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const response = await submitCodeReview(values.code);
      message.success('代码提交成功！');
      form.resetFields();
      // 使用React Router进行客户端路由跳转
      navigate(`/submission/${response.submission_id}`);
    } catch (error) {
      message.error('代码提交失败，请重试');
      console.error('Submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form form={form} onFinish={handleSubmit} layout="vertical">
      <Form.Item
        name="code"
        label="代码"
        rules={[{ required: true, message: '请输入代码' }]}
      >
        <TextArea rows={10} placeholder="请输入要审查的代码" />
      </Form.Item>
      
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          提交审查
        </Button>
      </Form.Item>
    </Form>
  );
};

export default SubmissionForm;