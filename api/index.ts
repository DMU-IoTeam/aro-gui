import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// AsyncStorage에서 accessToken을 가져오는 함수
const getAccessToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    return token;
  } catch (e) {
    console.error('Failed to fetch the token from storage', e);
    return null;
  }
};

// AsyncStorage에 accessToken을 저장하는 함수
export const setAccessToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem('accessToken', token);
  } catch (e) {
    console.error('Failed to save the token to storage', e);
  }
};

// 플랫폼에 따라 다른 localhost 주소를 사용
// const baseURL = 'http://10.0.2.2:8080';
const baseURL = 'https://6a5ce4ef7bdb.ngrok-free.app' 

const apiClient = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Axios 요청 인터셉터 설정
apiClient.interceptors.request.use(
  async config => {
    const token = await getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

export default apiClient;

