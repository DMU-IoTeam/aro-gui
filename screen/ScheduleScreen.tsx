import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import SafeAreaContainer from '@/components/Common/SafeAreaContainer';
import { getSchedulesBySenior, type SeniorSchedule } from '@/api/schedule';
import { getMe } from '@/api/user';

type ActivityStatus = '완료' | '대기중' | '진행중';

type ScheduleItem = {
  id: number;
  title: string;
  memo: string;
  startTime: string;
  status: ActivityStatus;
};

const STATUS_COLORS: Record<ActivityStatus, string> = {
  완료: '#34D399',
  대기중: '#F97316',
  진행중: '#2563EB',
};

const SUMMARY_CONFIG = [
  { key: 'completed', label: '완료한 활동', color: '#34D399', icon: '🏆' },
  { key: 'progress', label: '진행중인 활동', color: '#FBBF24', icon: '⏱️' },
  { key: 'streak', label: '연속 기록', color: '#60A5FA', icon: '⚡' },
] as const;

const deriveStatus = (schedule: SeniorSchedule): ActivityStatus => {
  const start = new Date(schedule.startTime).getTime();
  const now = Date.now();
  if (start < now - 3600 * 1000) {
    return '완료';
  }
  if (start > now + 3600 * 1000) {
    return '대기중';
  }
  return '진행중';
};

export default function ScheduleScreen() {
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedules = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const user = await getMe();
      if (!user?.id) {
        throw new Error('로그인 정보에서 시니어 ID를 찾을 수 없어요.');
      }
      const schedules = await getSchedulesBySenior(user.id);
      const mapped = schedules.map(schedule => ({
        ...schedule,
        status: deriveStatus(schedule),
      }));
      setItems(mapped);
    } catch (err) {
      console.error('Failed to fetch schedules:', err);
      setError(
        '오늘 일정을 불러오는 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.',
      );
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const summary = useMemo(() => {
    const completed = items.filter(item => item.status === '완료').length;
    const progress = items.filter(item => item.status === '진행중').length;
    const streak = 7;
    return { completed, progress, streak };
  }, [items]);

  const renderActivities = () => {
    if (loading) {
      return (
        <View style={styles.stateContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.stateText}>건강 일정을 불러오는 중이에요...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.stateContainer}>
          <Text style={styles.stateText}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={fetchSchedules}>
            <Text style={styles.retryButtonText}>다시 시도하기</Text>
          </Pressable>
        </View>
      );
    }

    if (items.length === 0) {
      return (
        <View style={styles.stateContainer}>
          <Text style={styles.stateText}>등록된 오늘 일정이 없어요.</Text>
        </View>
      );
    }

    return items.map((activity, index) => {
      const iconSource =
        index % 2 === 0
          ? require('@/assets/images/activity1.png')
          : require('@/assets/images/activity2.png');

      return (
        <View key={activity.id} style={styles.activityCard}>
          <View style={styles.activityLeft}>
            <View
              style={[
                styles.activityIconWrapper,
                { backgroundColor: `${STATUS_COLORS[activity.status]}22` },
              ]}
            >
              <Image
                source={iconSource}
                style={styles.activityIcon}
                resizeMode="contain"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.activityTitle}>{activity.title}</Text>
              <Text style={styles.activityDescription}>
                {activity.memo || '건강을 생각해요'}
              </Text>
              <Text
                style={[
                  styles.activityRecommendation,
                  { color: STATUS_COLORS[activity.status] },
                ]}
              >
                {new Date(activity.startTime).toLocaleTimeString('ko-KR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          </View>
        </View>
      );
    });
  };

  return (
    <SafeAreaContainer style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerBadge}>
          <Image
            source={require('@/assets/images/schedule.png')}
            style={styles.headerIcon}
            resizeMode="contain"
          ></Image>
        </View>
        <Text style={styles.title}>일정 확인</Text>
        <Text style={styles.subtitle}>오늘의 일정을 확인해보세요</Text>

        <View style={styles.cardList}>{renderActivities()}</View>
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
  },
  headerBadge: {
    alignSelf: 'center',
    marginTop: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    width: 80,
    height: 80,
  },
  title: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 40,
    fontWeight: '700',
    color: '#0F172A',
  },
  subtitle: {
    marginTop: 6,
    textAlign: 'center',
    fontSize: 36,
    color: '#64748B',
  },
  cardList: {
    marginTop: 24,
    paddingHorizontal: 20,
    gap: 16,
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingVertical: 18,
    paddingHorizontal: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 3,
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  activityIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityIcon: {
    width: 80,
    height: 80,
  },
  activityTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0F172A',
  },
  activityDescription: {
    marginTop: 4,
    fontSize: 28,
    color: '#64748B',
  },
  activityRecommendation: {
    marginTop: 6,
    fontSize: 24,
    fontWeight: '600',
  },
  activityStatusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#EEF2FF',
  },
  activityStatusText: {
    fontSize: 14,
    fontWeight: '700',
  },
  summaryTitle: {
    marginTop: 32,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  summaryRow: {
    marginTop: 20,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
  },
  summaryCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 18,
    borderWidth: 2,
  },
  summaryIcon: {
    fontSize: 22,
  },
  summaryLabel: {
    marginTop: 6,
    fontSize: 14,
    color: '#475569',
  },
  summaryValue: {
    marginTop: 4,
    fontSize: 18,
    fontWeight: '700',
  },
  actionsRow: {
    marginTop: 28,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
  },
  actionsButton: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#2563EB',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5F5',
  },
  secondaryButtonText: {
    color: '#1E293B',
    fontSize: 16,
    fontWeight: '600',
  },
  stateContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 12,
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
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
  retryButton: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#2563EB',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
