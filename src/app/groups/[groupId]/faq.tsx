import ScreenLayout from '@/src/components/ScreenLayout';
import { Linking, Pressable, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import Header from '../../../components/Header';
import { BoldText, MediumText } from '../../../components/Texts';
import { useCurrencyMetadata } from '../../../hooks/queries/useCurrencyMetadata';

const FaqPage = () => {
  const { data, updatedAtText, isPending, isError, refetch } = useCurrencyMetadata();

  return (
    <ScreenLayout>
      <Header title="FAQ" showBackButton onBackClick={() => router.back()} />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
        bounces={false}
        alwaysBounceVertical={false}
        overScrollMode="never"
        showsVerticalScrollIndicator={false}
      > 
        <View className="flex-1 pt-4 pb-8 flex-col gap-4">
          {/* 첫 번째 질문 */}
          <View className="mb-5">
            <BoldText className="text-lg mb-2 text-gray-900">
              공금을 걷었어요! 어떻게 해야 하나요?
            </BoldText>
            <View className="flex-col gap-1">
              <MediumText className="text-gray-600 text-base">
                • 여행 시작 전 공금 걷은 사람(총무)에게 송금을 기록하세요.
              </MediumText>
              <MediumText className="text-gray-600 text-base">
                • 이후 공금이 사용될 때마다 총무의 이름으로 지출을 기록하세요.
              </MediumText>
            </View>
          </View>

          {/* 두 번째 질문 */}
          <View className="mb-5">
            <BoldText className="text-lg mb-2 text-gray-900">
              왜 이런 정산 결과가 나왔나요?
            </BoldText>
            <View className="flex-col gap-1">
              <MediumText className="text-gray-600 text-base">
                • 그룹에 총무가 있는 경우와 아닌 경우가 달라요.
              </MediumText>
              <MediumText className="text-gray-600 text-base">
                • 총무가 설정된 경우에는 모든 사람이 총무를 통해서 송금을 주고받고 정산을 완료해요.
              </MediumText>
              <MediumText className="text-gray-600 text-base">
                • 총무가 없는 그룹은 멤버들끼리 서로 송금을 주고받는데, 송금과정이 단순화될 수 있어요.
              </MediumText>
              <MediumText className="text-gray-600 text-base">
                • 예시: A → B, B → C로 각각 송금해야 하는 경우, A → C로 직접 송금
              </MediumText>
            </View>
          </View>

          {/* 세 번째 질문 */}
          <View className="mb-5">
            <BoldText className="text-lg mb-2 text-gray-900">
              방에 이상한 사람이 들어온 것 같아요!
            </BoldText>
            <View className="flex-col gap-1">
              <MediumText className="text-gray-600 text-base">
                • 링크와 비밀번호가 모두 유출되면 모르는 사람이 들어올 수 있으니 항상 조심해야 해요.
              </MediumText>
              <MediumText className="text-gray-600 text-base">
                • 남은 정산을 빠르게 마치고 새로운 방을 만들어 사용하세요!
              </MediumText>
            </View>
          </View>

          <View className="mb-5">
            <BoldText className="text-lg mb-2 text-gray-900">
              환율은 언제 기준인가요?
            </BoldText>
            <View className="flex-col gap-1">
              <MediumText className="text-gray-600 text-base">
                • {data?.source ?? 'exchangeratesapi.io'}가 전 세계 은행과 금융 데이터 제공업체의 시장 환율을 종합한 데이터를 사용해요.
              </MediumText>
              <MediumText className="text-gray-600 text-base">
                • 일반적으로 매수·매도 가격의 중간값을 기준으로 하며, 은행의 실제 환전·송금 환율과는 차이가 있을 수 있어요.
              </MediumText>
              <MediumText className="text-gray-600 text-base" accessibilityLiveRegion="polite">
                • 최근 업데이트: {isPending ? '확인 중이에요.' : isError ? '업데이트 정보를 불러오지 못했어요.' : updatedAtText ?? '업데이트 정보가 아직 없어요.'}
              </MediumText>
              {isError && (
                <Pressable accessibilityRole="button" onPress={() => refetch()} className="self-start p-2">
                  <MediumText className="text-gray-600 text-base underline">다시 시도</MediumText>
                </Pressable>
              )}
              <Pressable accessibilityRole="link" onPress={() => Linking.openURL('https://exchangeratesapi.io/faq/')} className="self-start py-2">
                <MediumText className="text-gray-600 text-base underline">환율 원출처 안내</MediumText>
              </Pressable>
            </View>
          </View>

          {/* Tip 섹션 */}
          <View className="bg-gray-50 p-4 rounded-lg">
            <BoldText className="text-lg mb-2 text-gray-900">
              Tip. 사람이 많을수록 좋아요.
            </BoldText>
            <MediumText className="text-gray-600 text-base">
              N빵은 더 많은 사람들이 다양하게 참여했을 때 더 큰 힘을 발휘해요!
            </MediumText>
          </View>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
};

export default FaqPage;
