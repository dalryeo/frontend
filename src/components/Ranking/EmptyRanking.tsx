import { LAYOUT } from '../../constants/Layout';
import { EmptyState } from '../common/EmptyState';

export function EmptyRanking() {
  return (
    <EmptyState
      title={`이번 주의 기록이\n쌓이는 중이에요`}
      description={`월요일에 첫 랭킹이 정산돼요\n지금 달리면 상위권의 주인공이 될 수 있어요`}
      style={{ paddingTop: LAYOUT.EMPTY.PADDING_TOP }}
    />
  );
}
