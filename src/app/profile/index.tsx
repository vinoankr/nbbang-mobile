import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, View } from "react-native";
import { router } from "expo-router";
import { useProfile } from "../../hooks/queries/useMe";
import { BankName } from "../../constants/banks";
import { useUpdateProfile } from "../../hooks/mutations/useUpdateProfile";
import Toast from "react-native-toast-message";
import Header from "../../components/Header";
import { ProfileForm } from "../../components/auth/ProfileForm";
import Spinner from "../../components/Spinner";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ProfilePage = () => {
  const { data: user, isLoading } = useProfile();
  const { mutate: updateProfile, isPending } = useUpdateProfile();

  const handleUpdateProfile = (data: { name: string; bank: BankName; accountNumber: string }) => {
    updateProfile({
      name: data.name,
      bank: data.bank,
      account_number: data.accountNumber
    }, {
      onSuccess: () => {
        Toast.show({
          type: 'success',
          text1: '내 정보 수정 완료!',
        });
        router.back();
      }
    });
  };

  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView className="flex-1 bg-white" style={{
      paddingTop: insets.top,
    }}>
      <Header 
        title="내 정보 수정" 
        showBackButton={true} 
        onBackClick={() => router.back()} 
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, backgroundColor: 'white' }}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}
          bounces={false}
          alwaysBounceVertical={false}
          overScrollMode="never"
          showsVerticalScrollIndicator={false}
        >
          
          <View className="flex-1 px-4 pt-20">
            {user ? (
              <ProfileForm
                isLoading={isLoading || isPending}
                updateUserProfile={handleUpdateProfile}
                defaultValues={{
                  name: user.name,
                  bank: user.bank as BankName,
                  accountNumber: user.account_number || '',
                }}
                isEdit={true}
              />
            ) : (
              <View className="flex-1 justify-center items-center">
                <Spinner />
              </View>
            )}
          </View>
          </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ProfilePage;
