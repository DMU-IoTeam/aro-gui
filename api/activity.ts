import apiClient from './index';

// 참고: 서버의 실제 데이터 모델에 맞게 수정이 필요합니다.
export interface MedicationLog {
  id: number;
  medicationName: string;
  takenAt: string; // ISO 8601 날짜/시간 형식
  // 기타 필요한 속성들...
}

export interface CareEvent {
  id: number;
  eventType: 'fall_detection' | 'other_event';
  occurredAt: string; // ISO 8601 날짜/시간 형식
  // 기타 필요한 속성들...
}

/**
 * 특정 노인의 약 복용 기록을 조회합니다.
 * @param seniorId - 노인의 ID
 */
export const getMedicationLogs = async (seniorId: number): Promise<MedicationLog[]> => {
  try {
    // TODO: 실제 API 엔드포인트로 수정하세요. (예: '/api/v1/seniors/{seniorId}/medication-logs')
    const response = await apiClient.get(`/seniors/${seniorId}/medication-logs`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching medication logs for senior ${seniorId}:`, error);
    throw error;
  }
};

/**
 * 특정 노인의 케어 이벤트(예: 낙상 감지) 목록을 조회합니다.
 * @param seniorId - 노인의 ID
 */
export const getCareEvents = async (seniorId: number): Promise<CareEvent[]> => {
  try {
    // TODO: 실제 API 엔드포인트로 수정하세요. (예: '/api/v1/seniors/{seniorId}/care-events')
    const response = await apiClient.get(`/seniors/${seniorId}/care-events`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching care events for senior ${seniorId}:`, error);
    throw error;
  }
};
