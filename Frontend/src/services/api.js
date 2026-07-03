import axios from 'axios';

const api = axios.create({
  baseURL: 'http://35.159.123.31:5000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60s to allow Gemini LLM processing
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('[API Error]', error.response?.status, error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;