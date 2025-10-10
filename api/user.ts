import apiClient from './index';

// 참고: 서버의 실제 User 모델에 맞게 수정이 필요합니다.
export interface User {
  email: string;
  name: string;
  role: 'GUARDIAN' | 'ADMIN';
  // 기타 필요한 속성들...
}

export interface LoginResponse {
  accessToken: string;
}

/**
 * 시니어 사용자로 로그인합니다.
 * @param email
 */
export const loginSenior = async (email: string): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>(
    '/api/auth/login/senior',
    { "email": email },
  );
  console.log(response);
  return response.data;
};

/**
 * 현재 로그인된 사용자의 정보를 조회합니다. (토큰 유효성 검증용)
 */
export const getMe = async (): Promise<User> => {
  // apiClient에 설정된 인터셉터가 자동으로 헤더에 토큰을 추가해줍니다.
  const response = await apiClient.get<User>('/api/users/me');
  // console.log(response);
  return response.data;
};

/**
 * 사용자의 FCM 토큰을 서버에 등록/갱신합니다.
 * @param fcmToken 사용자의 새로운 FCM 토큰
 */
export const registerFcmToken = async (token: string): Promise<void> => {
  await apiClient.patch('/api/users/me/firebase-token', {token});
};

/**
 * 사용자의 역할을 업데이트합니다.
 * @param role 변경할 역할 ('GUARDIAN' 또는 'ADMIN')
 */
export const updateUserRole = async (
  role: 'GUARDIAN' | 'ADMIN',
): Promise<User> => {
  const response = await apiClient.patch<User>('/api/users/me/role', {role});
  return response.data;
};

/**
 * 사용자를 탈퇴시킵니다.
 */
export const deleteUser = async (): Promise<void> => {
  await apiClient.delete('/api/users/me');
};