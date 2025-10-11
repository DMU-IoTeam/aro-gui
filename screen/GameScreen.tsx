import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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
import useSpeechRecognition from '@/hooks/useSpeechRecognition';

const SCORE_PER_CORRECT = 10;
const ADVANCE_DELAY_MS = 1100;

type GameResultParams = {
  score: number;
  total: number;
  correct: number;
  incorrect: number;
  hints: number;
};

export default function GameScreen() {
  const navigation = useNavigation();
  const [photos, setPhotos] = useState<SeniorPhoto[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [hintUsedCount, setHintUsedCount] = useState(0);
  const [recognizedText, setRecognizedText] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [hintUsedCurrent, setHintUsedCurrent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answerChecking, setAnswerChecking] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const advanceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const {
    transcript,
    isListening,
    status: speechStatus,
    error: speechError,
    isSupported: isSpeechSupported,
    startListening,
    stopListening,
    cancelListening,
    resetRecognition,
  } = useSpeechRecognition();

  useEffect(() => {
    setRecognizedText(transcript);
  }, [transcript]);

  const photoCount = photos.length;
  const hasPhotos = photoCount > 0;
  const currentQuestion = hasPhotos ? currentIndex + 1 : 0;
  const progressValue = hasPhotos ? currentQuestion / photoCount : 0;
  const currentPhoto = hasPhotos ? photos[currentIndex] : undefined;
  const currentCaption = currentPhoto?.caption ?? '';

  useEffect(
    () => () => {
      if (advanceTimerRef.current) {
        clearTimeout(advanceTimerRef.current);
      }
    },
    [],
  );

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
  }, [resetRecognition]);

  const resetQuestionState = useCallback(() => {
    setRecognizedText('');
    setShowHint(false);
    setHintUsedCurrent(false);
    setFeedback(null);
    void resetRecognition();
  }, [resetRecognition]);

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
      setHintUsedCount(0);
      setRecognizedText('');
      setShowHint(false);
      setHintUsedCurrent(false);
      await resetRecognition();
    } catch (err) {
      console.error('Failed to load senior photos:', err);
      setPhotos([]);
      setError('사진을 불러오지 못했어요. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  const progressLabel = useMemo(() => {
    if (!hasPhotos) {
      return '0/0';
    }
    return `${currentQuestion}/${photoCount}`;
  }, [currentQuestion, hasPhotos, photoCount]);

  const primaryListeningMessage = useMemo(() => {
    if (!isSpeechSupported) {
      return '이 기기에서는 음성 인식을 사용할 수 없어요.';
    }
    switch (speechStatus) {
      case 'starting':
        return '마이크를 준비하고 있어요...';
      case 'listening':
        return '음성을 듣고 있어요...';
      case 'processing':
        return '음성을 처리 중이에요...';
      case 'error':
        return speechError ?? '음성 인식 중 문제가 발생했어요.';
      default:
        return '마이크 버튼을 눌러 시작하세요';
    }
  }, [isSpeechSupported, speechError, speechStatus]);

  const secondaryListeningMessage = useMemo(() => {
    if (!isSpeechSupported) {
      return '텍스트 입력 기능을 준비 중이에요.';
    }
    if (speechStatus === 'processing') {
      return '조금만 기다려주세요...';
    }
    return isListening
      ? '말씀이 끝나면 마이크를 다시 눌러주세요'
      : '마이크 버튼을 눌러 답변하세요';
  }, [isListening, isSpeechSupported, speechStatus]);

  const toggleHint = useCallback(() => {
    if (!hasPhotos || loading) {
      return;
    }
    setShowHint((prev) => {
      const next = !prev;
      if (next && !hintUsedCurrent) {
        setHintUsedCount((count) => count + 1);
        setHintUsedCurrent(true);
      }
      return next;
    });
  }, [hasPhotos, hintUsedCurrent, loading]);

  const toggleListening = useCallback(async () => {
    if (!hasPhotos || loading || !isSpeechSupported) {
      return;
    }

    try {
      if (isListening) {
        await stopListening();
      } else {
        await resetRecognition();
        setRecognizedText('');
        setFeedback(null);
        await startListening();
      }
    } catch (err) {
      console.error('Failed to toggle listening:', err);
    }
  }, [
    hasPhotos,
    isListening,
    loading,
    resetRecognition,
    startListening,
    stopListening,
    isSpeechSupported,
  ]);

  const handleRetake = useCallback(async () => {
    if (!hasPhotos || loading || !isSpeechSupported) {
      return;
    }
    setRecognizedText('');
    setFeedback(null);
    try {
      await resetRecognition();
      await startListening();
    } catch (err) {
      console.error('Failed to retake recording:', err);
    }
  }, [hasPhotos, isSpeechSupported, loading, resetRecognition, startListening]);

  const advanceToNext = useCallback(
    (nextIndex: number, nextScore: number, nextCorrect: number, nextIncorrect: number, nextHints: number) => {
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
      cancelListening().catch(() => null);
      setCurrentIndex(nextIndex);
      resetQuestionState();
    },
    [cancelListening, navigateToResult, photoCount, resetQuestionState],
  );

  const submitAnswer = useCallback(async () => {
    if (
      !hasPhotos ||
      loading ||
      answerChecking ||
      !recognizedText.trim() ||
      !currentPhoto?.photoId
    ) {
      return;
    }

    try {
      setAnswerChecking(true);
      await stopListening().catch(() => null);
      const trimmedAnswer = recognizedText.trim();
      const response = await checkPhotoAnswer(currentPhoto.photoId, {
        answer: trimmedAnswer,
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
    advanceToNext,
    currentIndex,
    currentPhoto?.photoId,
    correctCount,
    hasPhotos,
    hintUsedCount,
    incorrectCount,
    loading,
    recognizedText,
    score,
    stopListening,
    answerChecking,
  ]);

  const handleSubmit = useCallback(() => {
    submitAnswer();
  }, [submitAnswer]);

  const handleSkip = useCallback(() => {
    if (!hasPhotos || loading) {
      return;
    }

    cancelListening().catch(() => null);
    setFeedback(null);
    const updatedIncorrect = incorrectCount + 1;
    setIncorrectCount(updatedIncorrect);
    advanceToNext(
      currentIndex + 1,
      score,
      correctCount,
      updatedIncorrect,
      hintUsedCount,
    );
  }, [
    advanceToNext,
    cancelListening,
    correctCount,
    currentIndex,
    hasPhotos,
    hintUsedCount,
    incorrectCount,
    loading,
    score,
  ]);

  const photoUri = resolveImageUrl(currentPhoto?.imageUrl);
  const micDisabled = !hasPhotos || loading || !isSpeechSupported;

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
              사진을 보고 음성으로 답해보세요!
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

        <View style={styles.voiceCard}>
          <Pressable
            onPress={toggleListening}
            disabled={micDisabled}
            style={[
              styles.micButton,
              isListening ? styles.micButtonActive : undefined,
              micDisabled && styles.disabledButton,
            ]}
          >
            <Image
              source={require('@/assets/images/mic-button.png')}
              style={styles.micImage}
            />
          </Pressable>
          <View style={styles.voiceTextWrapper}>
            <Text style={styles.voicePrimaryText}>
              {primaryListeningMessage}
            </Text>
            <Text style={styles.voiceSecondaryText}>
              {secondaryListeningMessage}
            </Text>
          </View>
        </View>

        {speechError ? (
          <Text style={styles.speechErrorText}>{speechError}</Text>
        ) : null}

        <View style={styles.answerCard}>
          <Text style={styles.answerLabel}>인식된 답변</Text>
          <Text style={styles.answerText}>
            {recognizedText || '아직 답변이 인식되지 않았어요'}
          </Text>
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

        <Pressable
          style={[
            styles.hintCard,
            showHint && styles.hintCardActive,
            (!hasPhotos || loading) && styles.disabledButton,
          ]}
          onPress={toggleHint}
          disabled={!hasPhotos || loading}
        >
          <View style={styles.hintIconWrapper}>
            <Text style={styles.hintIcon}>💡</Text>
          </View>
          <View style={styles.hintTextWrapper}>
            <Text style={styles.hintTitle}>힌트 보기</Text>
            <Text style={styles.hintDescription}>
              {showHint
                ? currentCaption || '힌트를 준비 중이에요.'
                : '어려우면 힌트를 확인해보세요'}
            </Text>
          </View>
          <Text style={styles.hintArrow}>{showHint ? '‹' : '›'}</Text>
        </Pressable>

        <View style={styles.actionRow}>
          <Pressable
            style={[
              styles.actionButton,
              styles.secondaryButton,
              micDisabled && styles.disabledButton,
            ]}
            onPress={handleRetake}
            disabled={micDisabled}
          >
            <Text style={styles.secondaryButtonText}>다시 말하기</Text>
          </Pressable>
          <Pressable
            style={[
              styles.actionButton,
              styles.primaryButton,
              (!hasPhotos || loading || !recognizedText.trim()) &&
                styles.disabledButton,
            ]}
            onPress={handleSubmit}
            disabled={!hasPhotos || loading || !recognizedText.trim()}
          >
            {answerChecking ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>답변 제출하기</Text>
            )}
          </Pressable>
          <Pressable
            style={[
              styles.actionButton,
              styles.dangerButton,
              (!hasPhotos || loading) && styles.disabledButton,
            ]}
            onPress={handleSkip}
            disabled={!hasPhotos || loading}
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
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
    fontSize: FontSizes.large,
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
    marginBottom: 24,
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
    height: 220,
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
    marginTop: 28,
    textAlign: 'center',
    fontSize: FontSizes.medium,
    fontWeight: '700',
    color: '#0F172A',
  },
  voiceCard: {
    marginTop: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    flexDirection: 'row',
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  micButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  micButtonActive: {
    backgroundColor: '#F87171',
  },
  micImage: {
    width: 34,
    height: 34,
    resizeMode: 'contain',
  },
  voiceTextWrapper: {
    marginLeft: 16,
    flex: 1,
  },
  voicePrimaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  voiceSecondaryText: {
    marginTop: 4,
    fontSize: 13,
    color: '#94A3B8',
  },
  speechErrorText: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 13,
    color: '#DC2626',
  },
  answerCard: {
    marginTop: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  answerLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 8,
  },
  answerText: {
    fontSize: FontSizes.medium,
    fontWeight: '700',
    color: '#0F172A',
  },
  feedbackChip: {
    marginTop: 14,
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
  hintCard: {
    marginTop: 22,
    backgroundColor: '#FFFBEB',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FACC15',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  hintCardActive: {
    backgroundColor: '#FEF3C7',
  },
  hintIconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  hintIcon: {
    fontSize: FontSizes.medium - 8,
  },
  hintTextWrapper: {
    flex: 1,
  },
  hintTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#B45309',
  },
  hintDescription: {
    marginTop: 4,
    fontSize: 13,
    color: '#B45309',
  },
  hintArrow: {
    fontSize: FontSizes.large - 4,
    color: '#D97706',
    fontWeight: '600',
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
  secondaryButton: {
    backgroundColor: '#E2E8F0',
  },
  secondaryButtonText: {
    color: '#475569',
    fontSize: 15,
    fontWeight: '600',
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
