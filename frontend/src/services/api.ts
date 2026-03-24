import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const submitCodeReview = async (code: string) => {
  const response = await api.post('/submit', {
    user_id: 'default',
    code_text: code,
  });
  return response.data;
};

export const getSubmissionDetail = async (id: string) => {
  const response = await api.get(`/review/${id}`);
  return response.data;
};

export const getSubmissionHistory = async (limit: number = 50) => {
  const response = await api.get(`/history?limit=${limit}`);
  return response.data;
};

export const getDashboardData = async () => {
  const response = await api.get('/dashboard');
  return response.data;
};

export default api;