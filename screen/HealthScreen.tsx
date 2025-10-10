import CommonHeader from '@/components/Common/CommonHeader';
import SafeAreaContainer from '@/components/Common/SafeAreaContainer';
import DailyReport from '@/components/HealthScreen/DailyReport';

const data = [
  {
    title: '체온 상태',
    imageUrl: require('@/assets/images/health-icon1.png'),
    contents: '열이 나거나 오한이 있나요?',
  },
  {
    title: '정신 상태',
    imageUrl: require('@/assets/images/health-icon2.png'),
    contents: '어지럽거나 머리가 아픈가요?',
  },
  {
    title: '신체 활동',
    imageUrl: require('@/assets/images/health-icon3.png'),
    contents: '몸에 힘이 있고 활동하기 괜찮은가요?',
  },
  {
    title: '기분 상태',
    imageUrl: require('@/assets/images/health-icon4.png'),
    contents: '기분이 좋고 컨디션이 괜찮은가요?',
  },
];

export default function HealthScreen() {
  return (
    <SafeAreaContainer>
      <CommonHeader
        imageUrl={require('@/assets/images/health-no-bg.png')}
        title="건강확인"
        contents="현재 시간"
      />
      <DailyReport title="오늘 컨디션을 확인해주세요" contents={data} />
    </SafeAreaContainer>
  );
}
