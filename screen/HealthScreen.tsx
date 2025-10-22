import SafeAreaContainer from '@/components/Common/SafeAreaContainer';
import {
  getHealthQuestions,
  postHealthAnswers,
  type HealthAnswer,
  type HealthQuestion,
} from '@/api/health';
import { getMe } from '@/api/user';
import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import { FontSizes } from '@/constants/Fonts';
import { useNavigation } from '@react-navigation/native';

type Theme = {
  icon: string;
  iconBackground: string;
  accentColor: string;
};

const DEFAULT_THEMES: Theme[] = [
  { icon: '💛', iconBackground: '#FFF6DC', accentColor: '#F59E0B' },
  { icon: '💤', iconBackground: '#E9F1FF', accentColor: '#2563EB' },
  { icon: '⚡️', iconBackground: '#FFE7EA', accentColor: '#EF4444' },
  { icon: '🌿', iconBackground: '#E8FDF3', accentColor: '#10B981' },
];

const THEME_BY_CATEGORY: Record<string, Theme> = {
  CONDITION: { icon: '💛', iconBackground: '#FFF6DC', accentColor: '#F59E0B' },
  SLEEP: { icon: '💤', iconBackground: '#E9F1FF', accentColor: '#2563EB' },
  STRESS: { icon: '⚡️', iconBackground: '#FFE7EA', accentColor: '#EF4444' },
  MOOD: { icon: '😊', iconBackground: '#FFEFF5', accentColor: '#F472B6' },
};

const getIconForQuestion = (questionId: number) => {
  switch (questionId) {
    case 1:
      return require('@/assets/images/health-icon2.png');
    case 2:
      return require('@/assets/images/health-icon1.png');
    case 3:
      return require('@/assets/images/health-icon2.png');
    case 4:
      return require('@/assets/images/health-icon2.png');
    default:
      return require('@/assets/images/health-icon2.png');
  }
};

const resolveQuestionTitle = (question: HealthQuestion) =>
  question.title ??
  question.question ??
  question.name ??
  question.content ??
  '질문';

const resolveQuestionDescription = (question: HealthQuestion) =>
  question.description ??
  question.detail ??
  question.subtitle ??
  question.content ??
  '';

const resolveOptionTitle = (option: HealthQuestion['options'][number]) =>
  option.title ?? option.label ?? option.name ?? '선택';

const resolveOptionSubtitle = (option: HealthQuestion['options'][number]) =>
  option.description ??
  option.detail ??
  option.subtitle ??
  option.content ??
  '';

const getThemeForQuestion = (
  question: HealthQuestion,
  index: number,
): Theme => {
  const categoryKey = question.category?.toUpperCase() ?? '';
  if (categoryKey && THEME_BY_CATEGORY[categoryKey]) {
    return THEME_BY_CATEGORY[categoryKey];
  }
  return DEFAULT_THEMES[index % DEFAULT_THEMES.length];
};

export default function HealthScreen() {
  const [questions, setQuestions] = useState<HealthQuestion[]>([]);
  const [selections, setSelections] = useState<Record<number, number | null>>(
    {},
  );
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation();

  const loadQuestions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const user = await getMe();
      if (!user?.id) {
        throw new Error('로그인 정보에 id가 없습니다.');
      }

      const data = await getHealthQuestions(user.id);
      setQuestions(data);
      const initialSelections = data.reduce(
        (acc, question) => ({ ...acc, [question.id]: null }),
        {} as Record<number, number | null>,
      );
      setSelections(initialSelections);
    } catch (err) {
      console.error('Failed to load health questions:', err);
      setQuestions([]);
      setSelections({});
      setError('건강 질문을 불러오지 못했어요. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const handleSelect = useCallback((questionId: number, optionId: number) => {
    setSelections(prev => {
      const current = prev[questionId];
      return {
        ...prev,
        [questionId]: current === optionId ? null : optionId,
      };
    });
  }, []);

  const handleSubmit = useCallback(() => {
    const answers = Object.values(selections);
    if (answers.some(answer => answer === null) || answers.length !== questions.length) {
      Alert.alert('모든 질문에 답변해주세요.');
      return;
    }

    setIsSubmitting(true);

    const payload: HealthAnswer[] = Object.entries(selections)
      .map(([questionId, optionId]) => {
        if (optionId === null) return null;
        const question = questions.find(q => q.id === Number(questionId));
        const option = question?.options.find(o => o.id === optionId);
        if (!option) return null;
        return {
          questionId: Number(questionId),
          answerText: resolveOptionTitle(option),
        };
      })
      .filter((answer): answer is HealthAnswer => answer !== null);

    postHealthAnswers(payload)
      .then(() => {
        Alert.alert('성공', '건강 상태가 성공적으로 기록되었습니다.', [
          {
            text: '확인',
            onPress: () => navigation.navigate('Home' as never),
          },
        ]);
      })
      .catch(error => {
        console.error('Failed to submit health answers:', error);
        Alert.alert('오류', '건강 상태 기록에 실패했습니다.');
      })
      .finally(() => {
        navigation.navigate('Home' as never);
      });
  }, [selections, questions, navigation]);

  const isActionDisabled =
    loading || isSubmitting || !!error || questions.length === 0;

  let content: React.ReactNode;

  if (loading) {
    content = (
      <View style={styles.stateContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.stateMessage}>질문을 불러오는 중이에요...</Text>
      </View>
    );
  } else if (error) {
    content = (
      <View style={styles.stateContainer}>
        <Text style={styles.stateMessage}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={loadQuestions}>
          <Text style={styles.retryButtonText}>다시 시도하기</Text>
        </Pressable>
      </View>
    );
  } else if (questions.length === 0) {
    content = (
      <View style={styles.stateContainer}>
        <Text style={styles.stateMessage}>표시할 건강 질문이 없어요.</Text>
        <Text style={styles.stateDescription}>
          설정에서 건강 질문을 추가한 뒤 다시 열어주세요.
        </Text>
      </View>
    );
  } else {
    content = questions.map((question, index) => {
      const theme = getThemeForQuestion(question, index);
      const questionTitle = resolveQuestionTitle(question);
      const questionDescription = resolveQuestionDescription(question);
      const selectedOptionId = selections[question.id] ?? null;

      return (
        <View key={question.id} style={styles.section}>
          <View style={styles.sectionHeader}>
            <View
              style={[
                styles.sectionIconWrapper,
                { backgroundColor: theme.iconBackground },
              ]}
            >
              <Image
                source={getIconForQuestion(question.id)}
                style={styles.sectionIcon}
              />
            </View>
            <View style={styles.sectionHeading}>
              <Text style={styles.sectionTitle}>{questionTitle}</Text>
              {questionDescription ? (
                <Text style={styles.sectionDescription}>
                  {questionDescription}
                </Text>
              ) : null}
            </View>
          </View>

          <View style={styles.optionGrid}>
            {(question.options ?? []).map(option => {
              const optionTitle = resolveOptionTitle(option);
              const optionSubtitle = resolveOptionSubtitle(option);
              const isSelected = selectedOptionId === option.id;

              return (
                <Pressable
                  key={option.id}
                  onPress={() => handleSelect(question.id, option.id)}
                  style={[
                    styles.optionCard,
                    {
                      borderColor: isSelected
                        ? theme.accentColor
                        : 'rgba(15, 23, 42, 0.06)',
                      backgroundColor: isSelected ? '#F5F8FF' : '#FFFFFF',
                      shadowOpacity: isSelected ? 0.12 : 0,
                      elevation: isSelected ? 4 : 0,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.radio,
                      {
                        borderColor: isSelected
                          ? theme.accentColor
                          : 'rgba(148, 163, 184, 0.8)',
                      },
                    ]}
                  >
                    {isSelected && (
                      <View
                        style={[
                          styles.radioInner,
                          { backgroundColor: theme.accentColor },
                        ]}
                      />
                    )}
                  </View>
                  <View style={styles.optionTextWrapper}>
                    <Text
                      style={[
                        styles.optionTitle,
                        isSelected && { color: theme.accentColor },
                      ]}
                    >
                      {optionTitle}
                    </Text>
                    {optionSubtitle ? (
                      <Text style={styles.optionSubtitle}>
                        {optionSubtitle}
                      </Text>
                    ) : null}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      );
    });
  }

  return (
    <SafeAreaContainer style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerBadge}>
          <Image source={require('@/assets/images/health.png')} style={{width: 64, height: 64, resizeMode: 'contain'}}></Image>
        </View>
        <Text style={styles.title}>건강 상태 확인</Text>
        <Text style={styles.subtitle}>
          오늘의 건강 상태를 선택해서 기록해보세요
        </Text>

        {content}

        <View style={styles.footer}>
          <Pressable
            onPress={handleSubmit}
            disabled={isActionDisabled}
            style={[
              styles.footerButton,
              styles.primaryButton,
              isActionDisabled && styles.disabledButton,
            ]}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>건강 상태 기록하기</Text>
            )}
          </Pressable>
          <Pressable
            disabled={isActionDisabled}
            style={[
              styles.footerButton,
              styles.secondaryButton,
              isActionDisabled && styles.disabledButton,
            ]}
          >
            <Text style={styles.secondaryButtonText}>나중에 하기</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaContainer>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F7FB',
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  headerBadge: {
    marginTop: 12,
    alignSelf: 'center',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E0E9FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    fontSize: 30,
  },
  title: {
    marginTop: 24,
    textAlign: 'center',
    fontSize: FontSizes.xlarge,
    fontWeight: '700',
    color: '#0F172A',
  },
  subtitle: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: FontSizes.medium,
    color: '#64748B',
  },
  section: {
    marginTop: 28,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 20,
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 24,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionIcon: {
    width: 32,
    height: 32,
  },
  sectionHeading: {
    marginLeft: 16,
    flex: 1,
  },
  sectionTitle: {
    fontSize: FontSizes.large,
    fontWeight: '700',
    color: '#0F172A',
  },
  sectionDescription: {
    marginTop: 4,
    color: '#94A3B8',
    fontSize: FontSizes.small,
  },
  optionGrid: {
    marginTop: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionCard: {
    flexBasis: '48%',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 16 },
    shadowRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  radio: {
    width: 30,
    height: 30,
    borderRadius: 9999,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 16,
    height: 16,
    borderRadius: 9999,
  },
  optionTextWrapper: {
    flex: 1,
  },
  optionTitle: {
    fontSize: FontSizes.medium,
    fontWeight: '600',
    color: '#0F172A',
  },
  optionSubtitle: {
    marginTop: 6,
    fontSize: FontSizes.small,
    color: '#94A3B8',
  },
  footer: {
    marginTop: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  footerButton: {
    flex: 1,
    height: 92,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#2563EB',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: FontSizes.medium,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5F5',
  },
  secondaryButtonText: {
    color: '#1E293B',
    fontSize: FontSizes.medium,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.45,
  },
  stateContainer: {
    marginTop: 32,
    paddingVertical: 36,
    paddingHorizontal: 24,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 2,
  },
  stateMessage: {
    marginTop: 16,
    fontSize: FontSizes.medium,
    fontWeight: '600',
    color: '#0F172A',
    textAlign: 'center',
  },
  stateDescription: {
    marginTop: 8,
    fontSize: FontSizes.small,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: '#2563EB',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: FontSizes.small,
    fontWeight: '600',
  },
});
