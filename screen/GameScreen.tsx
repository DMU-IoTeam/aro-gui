import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import SafeAreaContainer from '@/components/Common/SafeAreaContainer';

const { width } = Dimensions.get('window');

export default function GameScreen() {
  const [timeLeft, setTimeLeft] = useState(45);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const answers = [
    { id: 'A', name: '김민수' },
    { id: 'B', name: '이영희' },
    { id: 'C', name: '박지훈' },
    { id: 'D', name: '최수정' },
  ];

  return (
    <SafeAreaContainer style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Family Photo Name Game</Text>
        </View>

        {/* Main Game Section */}
        <View style={styles.gameSection}>
          {/* Game Title */}
          <View style={styles.titleContainer}>
            <View style={styles.titleIcon}>
              <Text style={styles.titleIconText}>👥</Text>
            </View>
            <View style={styles.titleTextContainer}>
              <Text style={styles.gameTitle}>가족 사진 이름 맞히기</Text>
              <Text style={styles.gameSubtitle}>사진 속 가족의 이름을 맞혀보세요!</Text>
            </View>
          </View>

          {/* Score and Level */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>🏆</Text>
              <Text style={styles.statText}>점수: 850점</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>🎯</Text>
              <Text style={styles.statText}>레벨 3</Text>
            </View>
          </View>

          {/* Photo Area */}
          <View style={styles.photoContainer}>
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoIcon}>🏔️</Text>
              <Text style={styles.photoText}>가족 사진</Text>
            </View>
            <View style={styles.photoControls}>
              <TouchableOpacity style={styles.controlButton}>
                <Text style={styles.controlText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.controlText}>2023년 12월</Text>
              <TouchableOpacity style={styles.controlButton}>
                <Text style={styles.controlText}>+</Text>
              </TouchableOpacity>
              <View style={styles.peopleCount}>
                <Text style={styles.peopleIcon}>👥</Text>
                <Text style={styles.controlText}>4명</Text>
              </View>
            </View>
          </View>

          {/* Question */}
          <View style={styles.questionContainer}>
            <Text style={styles.questionIcon}>❓</Text>
            <Text style={styles.questionText}>
              이 사진에서 빨간 원으로 표시된 사람의 이름은?
            </Text>
          </View>

          {/* Answer Options */}
          <View style={styles.answersContainer}>
            {answers.map((answer) => (
              <TouchableOpacity
                key={answer.id}
                style={[
                  styles.answerButton,
                  selectedAnswer === answer.id && styles.selectedAnswer,
                ]}
                onPress={() => setSelectedAnswer(answer.id)}
              >
                <View style={styles.answerLetter}>
                  <Text style={styles.answerLetterText}>{answer.id}</Text>
                </View>
                <Text style={styles.answerText}>{answer.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonIcon}>💡</Text>
              <Text style={styles.actionButtonText}>힌트</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.submitButton]}>
              <Text style={styles.submitButtonText}>정답 제출</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonIcon}>⏭️</Text>
              <Text style={styles.actionButtonText}>넘어가기</Text>
            </TouchableOpacity>
          </View>

          {/* Timer */}
          <View style={styles.timerContainer}>
            <Text style={styles.timerIcon}>⏰</Text>
            <Text style={styles.timerText}>남은 시간: {formatTime(timeLeft)}</Text>
          </View>
        </View>

        {/* Game Progress Section */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>게임 진행률</Text>
            <Text style={styles.progressCount}>7/15 문제 완료</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={styles.progressFill} />
          </View>
          <View style={styles.gameStats}>
            <View style={styles.gameStatItem}>
              <Text style={styles.gameStatIcon}>⚡</Text>
              <Text style={styles.gameStatText}>스피드킹</Text>
            </View>
            <View style={styles.gameStatItem}>
              <Text style={styles.gameStatIcon}>🎯</Text>
              <Text style={styles.gameStatText}>명중률 90%</Text>
            </View>
            <View style={styles.gameStatItem}>
              <Text style={styles.gameStatIcon}>🔥</Text>
              <Text style={styles.gameStatText}>연속5회</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerTitle: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  gameSection: {
    backgroundColor: '#FFF8DC',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  titleIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FF8C00',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  titleIconText: {
    fontSize: 24,
  },
  titleTextContainer: {
    flex: 1,
  },
  gameTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  gameSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 16,
    marginRight: 5,
  },
  statText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  photoContainer: {
    marginBottom: 20,
  },
  photoPlaceholder: {
    height: 200,
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  photoIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  photoText: {
    fontSize: 16,
    color: '#666',
  },
  photoControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  controlText: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  peopleCount: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  peopleIcon: {
    fontSize: 16,
    marginRight: 5,
  },
  questionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  questionIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  questionText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  answersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  answerButton: {
    width: (width - 80) / 2,
    height: 50,
    backgroundColor: '#FFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  selectedAnswer: {
    borderColor: '#FF8C00',
    backgroundColor: '#FFF8F0',
  },
  answerLetter: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FF8C00',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  answerLetterText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  answerText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    height: 45,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  submitButton: {
    backgroundColor: '#FF8C00',
    flex: 2,
  },
  actionButtonIcon: {
    fontSize: 16,
    marginRight: 5,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  submitButtonText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: 'bold',
  },
  timerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerIcon: {
    fontSize: 16,
    marginRight: 5,
  },
  timerText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  progressSection: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  progressCount: {
    fontSize: 14,
    color: '#666',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 15,
  },
  progressFill: {
    height: '100%',
    width: '47%', // 7/15 ≈ 47%
    backgroundColor: '#FF8C00',
    borderRadius: 4,
  },
  gameStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  gameStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gameStatIcon: {
    fontSize: 16,
    marginRight: 5,
  },
  gameStatText: {
    fontSize: 12,
    color: '#666',
  },
});
