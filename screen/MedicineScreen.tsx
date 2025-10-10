import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import CommonHeader from "@/components/Common/CommonHeader";
import SafeAreaContainer from "@/components/Common/SafeAreaContainer";
import DailyMedicine from "@/components/MedicineScreen/DailyMedicine";
import { getMedicationSchedule, MedicationSchedule } from '@/api/medication';

// 더미 데이터 (API 실패 시 사용)
const fallbackData = [
  {
    title: "고혈압약",
    imageUrl: require("@/assets/images/health-icon1.png"),
    contents: "1정, 식후 30분",
  },
];

export default function MedicineScreen() {
  const [medicationData, setMedicationData] = useState(fallbackData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 현재 시간을 가져오는 함수
  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // API 데이터를 컴포넌트에서 사용할 수 있는 형태로 변환
  const transformMedicationData = (schedules: MedicationSchedule[]) => {
    const transformedData: any[] = [];
    
    schedules.forEach((schedule) => {
      schedule.items.forEach((item) => {
        transformedData.push({
          title: item.name,
          imageUrl: require("@/assets/images/health-icon1.png"), // 기본 아이콘 사용
          contents: item.memo || "복용 시간: " + schedule.time,
          scheduleId: schedule.scheduleId,
          itemId: item.id,
        });
      });
    });

    return transformedData;
  };

  useEffect(() => {
    const fetchMedicationSchedule = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // TODO: 실제 seniorId를 사용하세요. 현재는 하드코딩된 값 사용
        const seniorId = 1; // 실제 앱에서는 사용자 ID나 선택된 노인 ID를 사용
        const schedules = await getMedicationSchedule(seniorId);
        
        if (schedules && schedules.length > 0) {
          const transformedData = transformMedicationData(schedules);
          setMedicationData(transformedData);
        } else {
          // 데이터가 없으면 더미 데이터 사용
          setMedicationData(fallbackData);
        }
      } catch (err) {
        console.error('Failed to fetch medication schedule:', err);
        setError('복약 정보를 불러오는데 실패했습니다.');
        // 에러 발생 시 더미 데이터 사용
        setMedicationData(fallbackData);
      } finally {
        setLoading(false);
      }
    };

    fetchMedicationSchedule();
  }, []);

  if (loading) {
    return (
      <SafeAreaContainer>
        <CommonHeader
          imageUrl={require("@/assets/images/medicine-no-bg.png")}
          title="복약 알림"
          contents={`현재 시각: ${getCurrentTime()}`}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0a7ea4" />
          <Text style={styles.loadingText}>
            복약 정보를 불러오는 중...
          </Text>
        </View>
      </SafeAreaContainer>
    );
  }

  return (
    <SafeAreaContainer>
      <CommonHeader
        imageUrl={require("@/assets/images/medicine-no-bg.png")}
        title="복약 알림"
        contents={`현재 시각: ${getCurrentTime()}`}
      />
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {error}
          </Text>
        </View>
      )}
      <DailyMedicine 
        title="오늘 복약을 확인해주세요" 
        contents={medicationData} 
      />
    </SafeAreaContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    padding: 20,
    backgroundColor: '#FEF2F2',
    margin: 20,
    borderRadius: 10,
  },
  errorText: {
    color: '#DC2626',
    textAlign: 'center',
  },
});
