import apiClient from './index';

export interface HealthQuestionOption {
  id: number;
  title?: string;
  label?: string;
  name?: string;
  content?: string;
  description?: string;
  detail?: string;
  subtitle?: string;
}

export interface HealthQuestion {
  id: number;
  title?: string;
  question?: string;
  name?: string;
  content?: string;
  description?: string;
  detail?: string;
  subtitle?: string;
  options: HealthQuestionOption[];
  category?: string;
}

/**
 * 시니어의 건강 질문 목록을 서버에서 가져옵니다.
 * @param seniorId 건강 질문을 조회할 시니어의 ID
 */
export const getHealthQuestions = async (
  seniorId: number,
): Promise<HealthQuestion[]> => {
  try {
    const response = await apiClient.get<any[]>(
      `/api/seniors/${seniorId}/health-questions`,
    );
    console.log(response.data);

    const transformedQuestions: HealthQuestion[] = response.data.map((q: any) => ({
      ...q,
      question: q.questionText,
      options: typeof q.options === 'string'
        ? q.options.split(',').map((option: string, index: number) => ({
            id: index,
            title: option.trim(),
          }))
        : [],
    }));

    return transformedQuestions;
  } catch (error) {
    console.error(
      `Error fetching health questions for senior ${seniorId}:`,
      error,
    );
    throw error;
  }
};

export interface HealthAnswer {
  questionId: number;
  answerText: string;
}

/**
 * 건강 질문에 대한 답변을 서버에 전송합니다.
 * @param answers 건강 질문에 대한 답변 배열
 */
export const postHealthAnswers = async (
  answers: HealthAnswer[],
): Promise<void> => {
  try {
    console.log('Posting health answers:', answers);
    await apiClient.post('/api/health-answers', answers);
  } catch (error) {
    console.error('Error posting health answers:', error);
    throw error;
  }
};
