import ScreenLayout from '@/src/components/ScreenLayout';
import { View } from "react-native";
import { router } from "expo-router";
import { useProfile } from "../../hooks/queries/useMe";
import { BankName } from "../../constants/banks";
import { useUpdateProfile } from "../../hooks/mutations/useUpdateProfile";
import Toast from "react-native-toast-message";
import Header from "../../components/Header";
import { ProfileForm } from "../../components/auth/ProfileForm";
import Spinner from "../../components/Spinner";
import { KeyboardAwareScrollView } from "@/src/components/Keyboard";

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


  return (
    <ScreenLayout variant="form">
      <Header 
        title="내 정보 수정" 
        showBackButton={true} 
        onBackClick={() => router.back()} 
      />
      <KeyboardAwareScrollView
        bottomOffset={50}
        style={{ flex: 1 }}
        className="flex-1 pt-4"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
        overScrollMode="never"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={false}
        alwaysBounceVertical={false}
      >
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
      </KeyboardAwareScrollView>
    </ScreenLayout>
  );
};

export default ProfilePage;
