import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { FontSizes } from '@/constants/Fonts';
import {
  checkPhotoAnswer,
  getSeniorPhotos,
  type SeniorPhoto,
} from '@/api/photo';
import { getMe } from '@/api/user';
import apiClient from '@/api';
import { useNavigation } from '@react-navigation/native';

const SCORE_PER_CORRECT = 10;
const ADVANCE_DELAY_MS = 1100;

type GameResultParams = {
  score: number;
  total: number;
  correct: number;
  incorrect: number;
  hints: number;
};

type Choice = {
  id: string;
  label: string;
};

export default function GameScreen() {
  const navigation = useNavigation();
  const [photos, setPhotos] = useState<SeniorPhoto[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [hintUsedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answerChecking, setAnswerChecking] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const advanceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const photoCount = photos.length;
  const hasPhotos = photoCount > 0;
  const currentQuestion = hasPhotos ? currentIndex + 1 : 0;
  const progressValue = hasPhotos ? currentQuestion / photoCount : 0;
  const currentPhoto = hasPhotos ? photos[currentIndex] : undefined;

  useEffect(() => {
    return () => {
      if (advanceTimerRef.current) {
        clearTimeout(advanceTimerRef.current);
      }
    };
  }, []);

  const resolveImageUrl = useCallback((imageUrl?: string) => {
    if (!imageUrl) {
      return undefined;
    }

    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }

    const { defaults } = apiClient;
    const baseURL = defaults?.baseURL ?? 'http://10.0.2.2:8080';
    return `${baseURL.replace(/\/$/, '')}/${imageUrl.replace(/^\//, '')}`;
  }, []);

  const resetQuestionState = useCallback(() => {
    setFeedback(null);
    setSelectedChoice(null);
  }, []);

  const navigateToResult = useCallback(
    (params: GameResultParams) => {
      navigation.navigate('GameResult' as never, params as never);
    },
    [navigation],
  );

  const loadPhotos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setFeedback(null);

      const user = await getMe();
      if (!user?.id) {
        throw new Error('로그인 정보에서 시니어 ID를 찾을 수 없습니다.');
      }

      const data = await getSeniorPhotos(user.id);
      setPhotos(data);
      setCurrentIndex(0);
      setScore(0);
      setCorrectCount(0);
      setIncorrectCount(0);
      resetQuestionState();
    } catch (err) {
      console.error('Failed to load senior photos:', err);
      setPhotos([]);
      setError('사진을 불러오지 못했어요. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  }, [resetQuestionState]);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  const progressLabel = useMemo(() => {
    if (!hasPhotos) {
      return '0/0';
    }
    return `${currentQuestion}/${photoCount}`;
  }, [currentQuestion, hasPhotos, photoCount]);

  const advanceToNext = useCallback(
    (
      nextIndex: number,
      nextScore: number,
      nextCorrect: number,
      nextIncorrect: number,
      nextHints: number,
    ) => {
      if (nextIndex >= photoCount) {
        navigateToResult({
          score: nextScore,
          total: photoCount,
          correct: nextCorrect,
          incorrect: nextIncorrect,
          hints: nextHints,
        });
        return;
      }
      setCurrentIndex(nextIndex);
      resetQuestionState();
    },
    [navigateToResult, photoCount, resetQuestionState],
  );

  const submitAnswer = useCallback(async () => {
    if (!hasPhotos || loading || answerChecking || !selectedChoice || !currentPhoto?.photoId) {
      return;
    }

    try {
      setAnswerChecking(true);
      const response = await checkPhotoAnswer(currentPhoto.photoId, {
        answer: selectedChoice,
      });
      const isCorrect = response?.isCorrect ?? false;

      if (isCorrect) {
        const updatedScore = score + SCORE_PER_CORRECT;
        const updatedCorrect = correctCount + 1;
        setScore(updatedScore);
        setCorrectCount(updatedCorrect);
        setFeedback('정답입니다! 잘하셨어요 👏');

        if (advanceTimerRef.current) {
          clearTimeout(advanceTimerRef.current);
        }
        advanceTimerRef.current = setTimeout(() => {
          advanceToNext(
            currentIndex + 1,
            updatedScore,
            updatedCorrect,
            incorrectCount,
            hintUsedCount,
          );
        }, ADVANCE_DELAY_MS);
      } else {
        const updatedIncorrect = incorrectCount + 1;
        setIncorrectCount(updatedIncorrect);
        setFeedback('아쉽지만 오답이에요. 다시 시도해볼까요?');
        if (advanceTimerRef.current) {
          clearTimeout(advanceTimerRef.current);
        }
        advanceTimerRef.current = setTimeout(() => {
          advanceToNext(
            currentIndex + 1,
            score,
            correctCount,
            updatedIncorrect,
            hintUsedCount,
          );
        }, ADVANCE_DELAY_MS);
      }
    } catch (err) {
      console.error('Failed to check answer:', err);
      setFeedback('답변 확인에 실패했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      setAnswerChecking(false);
    }
  }, [
    answerChecking,
    advanceToNext,
    correctCount,
    currentIndex,
    currentPhoto?.photoId,
    hasPhotos,
    hintUsedCount,
    incorrectCount,
    loading,
    score,
    selectedChoice,
  ]);

  const handleSubmit = useCallback(() => {
    submitAnswer();
  }, [submitAnswer]);

  const handleSkip = useCallback(() => {
    if (!hasPhotos || loading) {
      return;
    }

    setFeedback(null);
    const updatedIncorrect = incorrectCount + 1;
    setIncorrectCount(updatedIncorrect);
    advanceToNext(currentIndex + 1, score, correctCount, updatedIncorrect, hintUsedCount);
  }, [
    advanceToNext,
    correctCount,
    currentIndex,
    hasPhotos,
    hintUsedCount,
    incorrectCount,
    loading,
    score,
  ]);

  const handleSelectChoice = useCallback((label: string) => {
    setSelectedChoice((prev) => (prev === label ? null : label));
    setFeedback(null);
  }, []);

  const photoUri = resolveImageUrl(currentPhoto?.imageUrl);

  const choices: Choice[] = useMemo(() => {
    if (!currentPhoto) {
      return [];
    }
    const answer = currentPhoto.caption?.trim();
    const distractors = currentPhoto.distractorOptions
      ?.split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    const pool = [
      ...(answer ? [answer] : []),
      ...(distractors ?? []),
    ];

    return pool
      .map((label, index) => ({
        id: `${currentPhoto.photoId}-${index}`,
        label,
      }))
      .sort(() => Math.random() - 0.5);
  }, [currentPhoto]);

  const isSubmitDisabled = !selectedChoice || answerChecking;
  const isSkipDisabled = answerChecking || !hasPhotos;

  return (
    <SafeAreaContainer style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Image
              source={require('@/assets/images/camera.png')}
              style={styles.headerImage}
            />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>가족사진 맞히기 게임</Text>
            <Text style={styles.headerSubtitle}>
              사진을 보고 정답을 골라보세요!
            </Text>
          </View>
        </View>

        <View style={styles.progressWrapper}>
          <Text style={styles.progressLabel}>{progressLabel}</Text>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressBar,
                { width: `${progressValue * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.scoreLabel}>{score}점</Text>
        </View>

        <View style={styles.photoCard}>
          <View style={styles.photoPlaceholder}>
            {loading ? (
              <>
                <ActivityIndicator size="large" color="#6366F1" />
                <Text style={styles.photoStatusText}>
                  가족사진을 불러오는 중이에요...
                </Text>
              </>
            ) : error ? (
              <View style={styles.photoErrorWrapper}>
                <Text style={styles.photoStatusText}>{error}</Text>
                <Pressable style={styles.retryButton} onPress={loadPhotos}>
                  <Text style={styles.retryButtonText}>다시 시도하기</Text>
                </Pressable>
              </View>
            ) : photoUri ? (
              <Image
                source={{ uri: photoUri }}
                style={styles.photoImage}
                resizeMode="cover"
              />
            ) : (
              <>
                <Text style={styles.photoIcon}>🖼️</Text>
                <Text style={styles.photoStatusText}>
                  표시할 가족사진이 없어요.
                </Text>
              </>
            )}
          </View>
        </View>

        <Text style={styles.questionPrompt}>
          이 사진 속 인물은 누구일까요?
        </Text>

        <View style={styles.choiceList}>
          {choices.map((choice) => {
            const isSelected = selectedChoice === choice.label;
            return (
              <Pressable
                key={choice.id}
                style={[
                  styles.choiceButton,
                  isSelected && styles.choiceButtonSelected,
                ]}
                onPress={() => handleSelectChoice(choice.label)}
              >
                <Text
                  style={[
                    styles.choiceLabel,
                    isSelected && styles.choiceLabelSelected,
                  ]}
                >
                  {choice.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {feedback ? (
          <View
            style={[
              styles.feedbackChip,
              feedback.includes('정답')
                ? styles.feedbackPositive
                : styles.feedbackNegative,
            ]}
          >
            <Text style={styles.feedbackText}>{feedback}</Text>
          </View>
        ) : null}

        <View style={styles.actionRow}>
          <Pressable
            style={[
              styles.actionButton,
              styles.primaryButton,
              isSubmitDisabled && styles.disabledButton,
            ]}
            onPress={handleSubmit}
            disabled={isSubmitDisabled}
          >
            {answerChecking ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>정답 제출하기</Text>
            )}
          </Pressable>
          <Pressable
            style={[
              styles.actionButton,
              styles.dangerButton,
              isSkipDisabled && styles.disabledButton,
            ]}
            onPress={handleSkip}
            disabled={isSkipDisabled}
          >
            <Text style={styles.dangerButtonText}>건너뛰기</Text>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#E4E9FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  headerImage: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerSubtitle: {
    marginTop: 4,
    fontSize: 14,
    color: '#64748B',
  },
  progressWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  progressLabel: {
    width: 60,
    fontSize: 13,
    color: '#6366F1',
    fontWeight: '600',
  },
  progressTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#7C3AED',
    borderRadius: 4,
  },
  scoreLabel: {
    width: 60,
    textAlign: 'right',
    fontSize: 13,
    color: '#10B981',
    fontWeight: '600',
  },
  photoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3,
  },
  photoPlaceholder: {
    height: 400,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
  },
  photoIcon: {
    fontSize: FontSizes.medium,
    marginBottom: 8,
  },
  photoStatusText: {
    marginTop: 12,
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
  },
  photoErrorWrapper: {
    alignItems: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#6366F1',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  questionPrompt: {
    marginTop: 12,
    textAlign: 'center',
    fontSize: FontSizes.medium,
    fontWeight: '700',
    color: '#0F172A',
  },
  choiceList: {
    marginTop: 16,
    gap: 12,
  },
  choiceButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 18,
    paddingHorizontal: 18,
  },
  choiceButtonSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#EEF2FF',
  },
  choiceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  choiceLabelSelected: {
    color: '#2563EB',
  },
  feedbackChip: {
    marginTop: 16,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignSelf: 'center',
  },
  feedbackPositive: {
    backgroundColor: '#DCFCE7',
  },
  feedbackNegative: {
    backgroundColor: '#FEE2E2',
  },
  feedbackText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    textAlign: 'center',
  },
  actionRow: {
    marginTop: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#22C55E',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  dangerButton: {
    backgroundColor: '#FEE2E2',
  },
  dangerButtonText: {
    color: '#DC2626',
    fontSize: 15,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.45,
  },
});
