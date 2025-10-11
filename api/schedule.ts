import apiClient from './index';

export interface SeniorSchedule {
  id: number;
  title: string;
  memo: string;
  startTime: string;
}

export const getSchedulesBySenior = async (
  seniorId: number,
): Promise<SeniorSchedule[]> => {
  try {
    console.log(`Fetching schedules for senior ${seniorId}`);
    const response = await apiClient.get<SeniorSchedule[]>(
      `/api/schedules/senior/${seniorId}`,
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching schedules for senior ${seniorId}:`, error);
    throw error;
  }
};
