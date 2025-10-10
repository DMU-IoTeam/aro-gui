import apiClient from './index';

export interface Senior {
  id: number;
  name: string;
  birthDate: string;
  medicalHistory: string;
  gender?: string;
  address?: string;
  bloodType?: string;
  profileImage?: string;
}

/**
 * (관리자용) 모든 노인 목록을 조회합니다.
 */
export const getSeniors = async (): Promise<Senior[]> => {
  try {
    const response = await apiClient.get('/api/users/seniors');
    return response.data;
  } catch (error) {
    console.error('Error fetching seniors:', error);
    throw error;
  }
};

/**
 * 현재 로그인한 사용자의 노인 목록을 조회합니다.
 */
export const getMySeniors = async (): Promise<Senior[]> => {
  try {
    const response = await apiClient.get<Senior[]>('/api/users/seniors');
    return response.data;
  } catch (error) {
    console.error('Error fetching my seniors:', error);
    throw error;
  }
};

/**
 * 특정 ID의 노인 정보를 조회합니다.
 */
export const getSeniorById = async (seniorId: number): Promise<Senior> => {
  try {
    const response = await apiClient.get(`/seniors/${seniorId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching senior with id ${seniorId}:`, error);
    throw error;
  }
};

/**
 * 특정 ID의 노인 정보를 삭제합니다.
 */
export const deleteSenior = async (seniorId: number): Promise<void> => {
  try {
    await apiClient.delete(`/seniors/${seniorId}`);
  } catch (error) {
    console.error(`Error deleting senior with id ${seniorId}:`, error);
    throw error;
  }
};

export interface RegisterSeniorPayload {
  name: string;
  email: string; // email 필드 추가
  birthDate: string;
  gender: string;
  address: string;
  medicalHistory: string;
  bloodType: string;
  profileImage: string; // base64 문자열 또는 'default'
}

/**
 * 새로운 보호 대상자(노인)를 등록합니다.
 */
export const registerSenior = async (
  payload: RegisterSeniorPayload,
): Promise<Senior> => {
  try {
    const response = await apiClient.post<Senior>(
      '/api/users/register-senior',
      payload,
    );
    return response.data;
  } catch (error) {
    console.error('Error registering senior:', error);
    throw error;
  }
};

/**
 * Updates a senior's information.
 * @param seniorId - The ID of the senior to update.
 * @param payload - The data to update.
 */
export const updateSenior = async (
  seniorId: number,
  payload: RegisterSeniorPayload,
): Promise<Senior> => {
  try {
    const response = await apiClient.put<Senior>(
      `/api/users/senior/${seniorId}`,
      payload,
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating senior with id ${seniorId}:`, error);
    throw error;
  }
};