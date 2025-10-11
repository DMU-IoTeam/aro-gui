import apiClient from './index';

export interface SeniorPhoto {
  photoId: number;
  imageUrl: string;
  caption: string;
}

export interface CheckAnswerPayload {
  answer: string;
}

export interface CheckAnswerResponse {
  isCorrect: boolean;
}

/**
 * 시니어의 가족 사진 목록을 가져옵니다.
 * @param seniorId 사진을 조회할 시니어 ID
 */
export const getSeniorPhotos = async (
  seniorId: number,
): Promise<SeniorPhoto[]> => {
  try {
    const response = await apiClient.get<SeniorPhoto[]>(
      `/api/seniors/${seniorId}/photos`,
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching senior photos for senior ${seniorId}:`,
      error,
    );
    throw error;
  }
};

/**
 * 가족 사진 답변을 검증합니다.
 * @param photoId 사진 ID
 * @param payload 제출할 답변
 */
export const checkPhotoAnswer = async (
  photoId: number,
  payload: CheckAnswerPayload,
): Promise<CheckAnswerResponse> => {
  try {
    const response = await apiClient.post<CheckAnswerResponse>(
      `/api/photos/${photoId}/check-answer`,
      payload,
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error checking answer for photo ${photoId}:`,
      error,
    );
    throw error;
  }
};
