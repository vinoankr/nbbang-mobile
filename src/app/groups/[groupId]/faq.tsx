import { Platform, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import Header from '../../../components/Header';
import { BoldText, MediumText } from '../../../components/Texts';
import { SafeAreaView } from 'react-native-safe-area-context';

const FaqPage = () => {

  return (
    <SafeAreaView edges={Platform.OS === 'ios' ? ['top'] : ['top', 'bottom']} className="relative flex-1 bg-white">
      <Header title="FAQ" showBackButton onBackClick={() => router.back()} applyInsets={Platform.OS!=='ios'} />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
        bounces={false}
        alwaysBounceVertical={false}
        overScrollMode="never"
        showsVerticalScrollIndicator={false}
      > 
        <View className="flex-1 px-4 pt-16 flex-col gap-4">
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
                • N빵은 송금 횟수 최소화를 위해 정산 결과를 단순화해요.
              </MediumText>
              <MediumText className="text-gray-600 text-base">
                • 예시: A → B, B → C로 각각 송금해야 하는 경우, A → C로 직접 송금
              </MediumText>
              <MediumText className="text-gray-600 text-base">  
                • 예상한 결과와 달라도 안심하고 사용해주세요 🤗
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
    </SafeAreaView>
  );
};

export default FaqPage;
