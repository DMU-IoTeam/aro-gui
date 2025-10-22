import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
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
  time: string;
  imageUrl: ReturnType<typeof require>;
  scheduleId?: number;
  itemId?: number;
};

const formatTime = (time: string) => {
  if (!time) {
    return '복용 시간 정보가 없어요';
  }
  const [hour = '00', minute = '00'] = time.split(':');
  return `${hour}:${minute}`;
};

export default function MedicineScreen() {
  const [items, setItems] = useState<DailyMedicineItem[]>([]);
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
        (schedule.items ?? []).map((item) => {
          const formattedTime = formatTime(schedule.time);
          return {
            title: item.name,
            contents: item.memo?.trim() || '복용 메모가 없어요',
            time: formattedTime,
            imageUrl:
              item.id % 2 === 0
                ? require('@/assets/images/medicine.png')
                : require('@/assets/images/medicine2.png'),
            scheduleId: schedule.scheduleId,
            itemId: item.id,
          };
        }),
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
          setItems(transformed);
          setSelections({});
        } else {
          setItems([]);
          setSelections({});
        }
      } catch (err) {
        console.error('Failed to fetch medication schedule:', err);
        setError('복약 정보를 불러오는 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.');
        setItems([]);
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
  }, [confirmTargets, navigation]);

  const isConfirmDisabled = submitting || confirmTargets.length === 0;

  const renderHeader = () => (
    <>
      <View style={styles.headerBadge}>
        <Image
          source={require('@/assets/images/medicine.png')}
          style={styles.headerIcon}
          resizeMode="contain"
        />
      </View>
      <Text style={styles.title}>복약 상태 확인</Text>
    </>
  );

  if (loading) {
    return (
      <SafeAreaContainer style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.loadingContent}>
          {renderHeader()}
          <View style={styles.stateContainer}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.stateText}>복약 정보를 불러오는 중이에요...</Text>
          </View>
        </ScrollView>
      </SafeAreaContainer>
    );
  }

  return (
    <SafeAreaContainer style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {renderHeader()}
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : items.length === 0 ? (
          <View style={styles.stateContainer}>
            <Text style={styles.stateText}>복약 일정이 없습니다.</Text>
            <Text style={styles.stateDescription}>
              복약 일정을 등록하면 이곳에서 확인할 수 있어요.
            </Text>
          </View>
        ) : (
          <DailyMedicine
            title="오늘 복약을 확인해주세요"
            contents={items}
            selections={selections}
            onSelect={handleSelect}
          />
        )}
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
      </ScrollView>
    </SafeAreaContainer>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F7FB',
  },
  content: {
    paddingBottom: 32,
    gap: 20,
  },
  loadingContent: {
    paddingBottom: 32,
    alignItems: 'center',
    gap: 20,
  },
  headerBadge: {
    alignSelf: 'center',
    marginTop: 16,
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    width: 80,
    height: 80,
  },
  title: {
    textAlign: 'center',
    fontSize: 36,
    fontWeight: '700',
    color: '#0F172A',
  },
  subtitle: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 36,
    color: '#64748B',
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
  stateContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingVertical: 30,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 24,
    marginTop: 16,
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 2,
  },
  stateText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    textAlign: 'center',
  },
  stateDescription: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  confirmButton: {
    marginHorizontal: 24,
    marginTop: 12,
    marginBottom: 24,
    height: 104,
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
    fontSize: 28,
    fontWeight: '700',
  },
});
