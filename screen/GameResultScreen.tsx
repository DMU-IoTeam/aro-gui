import React, { useMemo } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import SafeAreaContainer from '@/components/Common/SafeAreaContainer';
import { FontSizes } from '@/constants/Fonts';
import { useNavigation, useRoute } from '@react-navigation/native';

type GameResultRouteParams = {
  score?: number;
  total?: number;
  correct?: number;
  incorrect?: number;
  hints?: number;
};

type RankingItem = {
  id: string;
  name: string;
  score: number;
  subtitle: string;
  accentColor: string;
  icon?: string;
  isSelf?: boolean;
};

export default function GameResultScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const {
    score = 0,
    total = 0,
    correct = 0,
    incorrect = 0,
    hints = 0,
  } = (route.params as GameResultRouteParams) || {};

  const performanceMessage = useMemo(() => {
    if (score >= 90) {
      return '완벽한 성과입니다!';
    }
    if (score >= 70) {
      return '훌륭한 성과입니다!';
    }
    if (score >= 50) {
      return '좋은 시작이에요. 계속 도전해봐요!';
    }
    return '연습을 거듭하면 더 좋아질 거예요!';
  }, [score]);

  const badgeData = useMemo(
    () => [
      {
        id: 'family-master',
        title: '패밀리 마스터',
        description: '8문제 이상 정답',
        achieved: correct >= 8,
        color: '#FCD34D',
      },
      {
        id: 'quick-responder',
        title: '빠른 응답자',
        description: '평균 5초 이내',
        achieved: score >= 60 && incorrect === 0,
        color: '#60A5FA',
      },
      {
        id: 'perfectionist',
        title: '완벽주의자',
        description: '실수 없이 완료',
        achieved: incorrect === 0,
        color: '#E2E8F0',
      },
    ],
    [correct, incorrect, score],
  );

  const rankingData: RankingItem[] = [
    {
      id: '1',
      name: '김할아버지',
      score: 92,
      subtitle: '오늘 플레이',
      accentColor: '#FBBF24',
      icon: '👑',
    },
    {
      id: 'me',
      name: '나 (김민수)',
      score,
      subtitle: '방금 플레이',
      accentColor: '#60A5FA',
      isSelf: true,
      icon: '🔍',
    },
    {
      id: '3',
      name: '김할머니',
      score: 78,
      subtitle: '3일 전 플레이',
      accentColor: '#F87171',
      icon: '👑',
    },
  ];

  const handleReplay = () => {
    navigation.replace('Game' as never);
  };

  const handleShare = () => {
    Alert.alert('준비 중', '결과 공유 기능은 곧 제공될 예정입니다.');
  };

  const handleGoHome = () => {
    navigation.navigate('Home' as never);
  };

  const renderProgressRing = () => (
    <View style={styles.scoreRingOuter}>
      <View style={styles.scoreRingInner}>
        <Text style={styles.scoreText}>{score}</Text>
        <Text style={styles.scoreLabel}>점</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaContainer style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Text style={styles.headerIconEmoji}>🏆</Text>
          </View>
          <Text style={styles.headerTitle}>게임 완료!</Text>
          <Text style={styles.headerSubtitle}>
            가족사진 맞히기를 모두 완료했습니다
          </Text>
        </View>

        {renderProgressRing()}

        <Text style={styles.performanceMessage}>{performanceMessage}</Text>

        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <View style={[styles.summaryIcon, { backgroundColor: '#E0F2FE' }]}>
              <Text style={styles.summaryIconText}>✅</Text>
            </View>
            <Text style={styles.summaryValue}>{correct}개</Text>
            <Text style={styles.summaryLabel}>정답</Text>
          </View>
          <View style={styles.summaryItem}>
            <View style={[styles.summaryIcon, { backgroundColor: '#FEE2E2' }]}>
              <Text style={styles.summaryIconText}>❌</Text>
            </View>
            <Text style={styles.summaryValue}>{incorrect}개</Text>
            <Text style={styles.summaryLabel}>오답</Text>
          </View>
          <View style={styles.summaryItem}>
            <View style={[styles.summaryIcon, { backgroundColor: '#FEF3C7' }]}>
              <Text style={styles.summaryIconText}>💡</Text>
            </View>
            <Text style={styles.summaryValue}>{hints}개</Text>
            <Text style={styles.summaryLabel}>힌트 사용</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>획득한 배지</Text>
          <View style={styles.badgeRow}>
            {badgeData.map((badge) => (
              <View
                key={badge.id}
                style={[
                  styles.badgeCard,
                  badge.achieved ? styles.badgeActive : styles.badgeInactive,
                ]}
              >
                <View
                  style={[
                    styles.badgeIconWrapper,
                    { backgroundColor: badge.color },
                  ]}
                >
                  <Text style={styles.badgeIcon}>
                    {badge.achieved ? '⭐' : '🔒'}
                  </Text>
                </View>
                <Text style={styles.badgeTitle}>{badge.title}</Text>
                <Text style={styles.badgeDescription}>{badge.description}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>가족 순위</Text>
          <View style={styles.rankingList}>
            {rankingData.map((item, index) => (
              <View
                key={item.id}
                style={[
                  styles.rankingItem,
                  {
                    borderColor: item.accentColor,
                    backgroundColor: item.isSelf
                      ? '#EFF6FF'
                      : index === 0
                      ? '#FEF3C7'
                      : index === 2
                      ? '#FEE2E2'
                      : '#FFFFFF',
                  },
                ]}
              >
                <View style={styles.rankingLeft}>
                  <View
                    style={[
                      styles.rankingPosition,
                      { backgroundColor: item.accentColor },
                    ]}
                  >
                    <Text style={styles.rankingPositionText}>
                      {index + 1}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.rankingName}>{item.name}</Text>
                    <Text style={styles.rankingSubtitle}>
                      {item.score}점 · {item.subtitle}
                    </Text>
                  </View>
                </View>
                <Text style={styles.rankingIcon}>{item.icon ?? '🏅'}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.footerButtons}>
          <Pressable style={[styles.footerButton, styles.footerReplay]} onPress={handleReplay}>
            <Text style={styles.footerButtonText}>다시 플레이</Text>
          </Pressable>
          <Pressable style={[styles.footerButton, styles.footerShare]} onPress={handleShare}>
            <Text style={styles.footerButtonText}>결과 공유</Text>
          </Pressable>
          <Pressable style={[styles.footerButton, styles.footerHome]} onPress={handleGoHome}>
            <Text style={styles.footerButtonText}>홈으로</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaContainer>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F6FB',
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginTop: 24,
  },
  headerIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  headerIconEmoji: {
    fontSize: 36,
  },
  headerTitle: {
    fontSize: FontSizes.large,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerSubtitle: {
    marginTop: 6,
    fontSize: 15,
    color: '#64748B',
  },
  scoreRingOuter: {
    alignSelf: 'center',
    marginTop: 24,
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 16,
    borderColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreRingInner: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    fontSize: 44,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scoreLabel: {
    fontSize: 18,
    color: '#D1FAE5',
    marginTop: 4,
  },
  performanceMessage: {
    marginTop: 28,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  summaryIconText: {
    fontSize: 22,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  section: {
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  badgeCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  badgeActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 2,
  },
  badgeInactive: {
    backgroundColor: '#F8FAFC',
  },
  badgeIconWrapper: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeIcon: {
    fontSize: 26,
  },
  badgeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
  },
  badgeDescription: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
  },
  rankingList: {
    gap: 12,
  },
  rankingItem: {
    borderRadius: 18,
    borderWidth: 1.5,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rankingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  rankingPosition: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankingPositionText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  rankingName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  rankingSubtitle: {
    marginTop: 2,
    fontSize: 13,
    color: '#64748B',
  },
  rankingIcon: {
    fontSize: 20,
  },
  footerButtons: {
    marginTop: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  footerButton: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerReplay: {
    backgroundColor: '#3B82F6',
  },
  footerShare: {
    backgroundColor: '#22C55E',
  },
  footerHome: {
    backgroundColor: '#1E293B',
  },
  footerButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
