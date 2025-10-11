import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import CommonHeader from '@/components/Common/CommonHeader';
import SafeAreaContainer from '@/components/Common/SafeAreaContainer';
import DailyMedicine, {
  type DailyMedicineSelection,
} from '@/components/MedicineScreen/DailyMedicine';
import {
  getMedicationSchedule,
  confirmMedicationLog,
  type MedicationSchedule,
} from '@/api/medication';
import { getMe } from '@/api/user';
import { useNavigation } from '@react-navigation/native';

type DailyMedicineItem = {
  title: string;
  contents: string;
  imageUrl: ReturnType<typeof require>;
  scheduleId?: number;
  itemId?: number;
};

const fallbackData: DailyMedicineItem[] = [
  {
    title: '등록된 복약 일정이 없어요',
    imageUrl: require('@/assets/images/health-icon1.png'),
    contents: '관리자에게 복약 일정을 등록해달라고 요청해보세요.',
  },
];

const formatTime = (time: string) => {
  if (!time) {
    return '복용 시간 정보가 없어요';
  }
  const [hour, minute] = time.split(':');
  return `${hour}:${minute}`;
};

export default function MedicineScreen() {
  const [items, setItems] = useState<DailyMedicineItem[]>(fallbackData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selections, setSelections] = useState<Record<number, DailyMedicineSelection>>({});
  const [submitting, setSubmitting] = useState(false);

  const navigation = useNavigation();

  const currentTimeLabel = useMemo(() => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }, []);

  const transformSchedule = useCallback(
    (schedules: MedicationSchedule[]): DailyMedicineItem[] =>
      schedules.flatMap((schedule) =>
        (schedule.items ?? []).map((item) => ({
          title: item.name,
          contents: item.memo || `복용 시간: ${formatTime(schedule.time)}`,
          imageUrl: require('@/assets/images/medicine.png'),
          scheduleId: schedule.scheduleId,
          itemId: item.id,
        })),
      ),
    [],
  );

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoading(true);
        setError(null);

        const user = await getMe();
        if (!user?.id) {
          throw new Error('로그인 정보에서 시니어 ID를 찾을 수 없어요.');
        }

        const schedules = await getMedicationSchedule(user.id);
        if (schedules && schedules.length > 0) {
          const transformed = transformSchedule(schedules);
          const nextItems = transformed.length > 0 ? transformed : fallbackData;
          setItems(nextItems);
          setSelections({});
        } else {
          setItems(fallbackData);
          setSelections({});
        }
      } catch (err) {
        console.error('Failed to fetch medication schedule:', err);
        setError('복약 정보를 불러오는 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.');
        setItems(fallbackData);
        setSelections({});
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, [transformSchedule]);

  const handleSelect = useCallback(
    (index: number, selection: DailyMedicineSelection) => {
      setSelections((prev) => {
        const next = { ...prev };
        if (selection === null) {
          delete next[index];
        } else {
          next[index] = selection;
        }
        return next;
      });
    },
  []);

  const confirmTargets = useMemo(() => {
    const targets = new Set<number>();
    Object.entries(selections).forEach(([indexKey, value]) => {
      if (value === '먹음') {
        const item = items[Number(indexKey)];
        if (item?.scheduleId != null) {
          targets.add(item.scheduleId);
        }
      }
    });
    return Array.from(targets);
  }, [items, selections]);

  const handleConfirm = useCallback(async () => {
    if (confirmTargets.length === 0) {
      Alert.alert('안내', '복약 완료로 표시된 일정이 없어요.');
      return;
    }

    try {
      setSubmitting(true);
      await Promise.all(
        confirmTargets.map((scheduleId) =>
          confirmMedicationLog({
            scheduleId,
            confirmedAt: new Date().toISOString(),
          }),
        ),
      );
      Alert.alert('완료', '복약 완료 기록이 저장되었어요.');
      setSelections({});
    } catch (err) {
      console.error('Failed to confirm medication logs:', err);
      Alert.alert('오류', '복약 완료 기록을 저장하지 못했어요. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
      navigation.navigate('Home' as never); // 복약 기록 후 홈으로 이동
    }
  }, [confirmTargets]);

  const isConfirmDisabled = submitting || confirmTargets.length === 0;

  if (loading) {
    return (
      <SafeAreaContainer>
        <CommonHeader
          imageUrl={require('@/assets/images/medicine-no-bg.png')}
          title="복약 알림"
          contents={`현재 시각: ${currentTimeLabel}`}
        />
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.centeredText}>복약 정보를 불러오는 중이에요...</Text>
        </View>
      </SafeAreaContainer>
    );
  }

  return (
    <SafeAreaContainer>
      <CommonHeader
        imageUrl={require('@/assets/images/medicine-no-bg.png')}
        title="복약 알림"
        contents={`현재 시각: ${currentTimeLabel}`}
      />
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
      <DailyMedicine
        title="오늘 복약을 확인해주세요"
        contents={items}
        selections={selections}
        onSelect={handleSelect}
      />
      <Pressable
        style={[styles.confirmButton, isConfirmDisabled && styles.confirmButtonDisabled]}
        onPress={handleConfirm}
        disabled={isConfirmDisabled}
      >
        {submitting ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.confirmButtonText}>복약 완료 기록하기</Text>
        )}
      </Pressable>
    </SafeAreaContainer>
  );
}

const styles = StyleSheet.create({
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  centeredText: {
    marginTop: 16,
    fontSize: 16,
    color: '#475569',
  },
  errorContainer: {
    marginHorizontal: 24,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#FEF2F2',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center',
  },
  confirmButton: {
    marginHorizontal: 24,
    marginTop: 12,
    marginBottom: 24,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#94A3B8',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
