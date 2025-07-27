import React, { useState, useRef } from 'react';
import { View, Keyboard } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { FormLabel } from '../form/FormLabel';
import { InputField } from '../form/InputField';
import { PrimaryButton } from '../form/PrimaryButton';
import { BANK_CODES, BANK_NAMES, BankName } from '@/src/constants/banks';
import { client } from '@/src/utils/client';
import { FormInfo } from '../form/FormInfo';
import { SelectField } from '../form/SelectField';

interface ProfileFormProps {
  isEdit: boolean;
  defaultValues?: ProfileFormData;
  isLoading: boolean;
  updateUserProfile: (data: { name: string, bank: BankName, accountNumber: string }) => void;
}

interface ProfileFormData {
  name: string;
  bank: BankName;
  accountNumber: string;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({
  isEdit = false,
  defaultValues,
  isLoading,
  updateUserProfile,  
}) => {
  const shouldAutoFocus = !isEdit;
  const [isBankVerifying, setIsBankVerifying] = useState(false);
  const isLoadingRef = useRef(false);
  const bankInputRef = useRef<any>(null);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isValid },
  } = useForm<ProfileFormData>({
    defaultValues: {
      name: defaultValues?.name || '',
      bank: defaultValues?.bank || BANK_NAMES[0],
      accountNumber: defaultValues?.accountNumber || '',
    },
    mode: 'onBlur',
  });

  const verifyBank = async (bankCode: string, bankNum: string) => {
    const response = await client.post('/auth/verify-bank', {
      bank_code: bankCode,
      bank_num: bankNum
    });
    return response.data;
  };

  const onSubmit = async (data: ProfileFormData) => {
    if (isLoadingRef.current) return;
    
    try {
      setIsBankVerifying(true);
      isLoadingRef.current = true;
      
      const bankCode = BANK_CODES[data.bank];
      const bankNum = data.accountNumber;
      
      const bankHolder = await verifyBank(bankCode, bankNum);
      const bankHolderName = bankHolder?.holderName;
      
      if (!bankHolder.success || !bankHolderName.includes(data.name)) {
        setError('name', { message: '이름 혹은 계좌정보를 다시 확인해주세요.' });
        return;
      } else {
        updateUserProfile({
          name: data.name,
          bank: data.bank,
          accountNumber: data.accountNumber
        });
      }
    } catch {
      setError('name', { message: '이름 혹은 계좌정보를 다시 확인해주세요.' });
    } finally {
      setIsBankVerifying(false);
      isLoadingRef.current = false;
    }
  };

  const isFormValid = isValid && !isLoading && !isBankVerifying;

  return (
    <View className="w-full flex-col gap-4">
      <View className="w-full">
        <FormLabel label="이름" />
        <Controller
          control={control}
          name="name"
          rules={{
            required: '이름을 입력해주세요',
            minLength: {
              value: 2,
              message: '2자 이상 입력해주세요'
            }
          }}
          render={({ field: { onChange, value, onBlur } }) => (
            <InputField
              value={value}
              onChangeText={onChange}
              placeholder="홍길동"
              autoFocus={shouldAutoFocus}
              returnKeyType="next"
              onBlur={onBlur}
              onSubmitEditing={() => bankInputRef.current?.focus()}
            />
          )}
        />
        <FormInfo message={errors.name?.message || '착오송금 방지를 위해 실명을 입력해주세요.'} isError={!!errors.name} />
      </View>

      <View className="w-full">
        <FormLabel label="주 사용 은행" />
        <Controller
          control={control}
          name="bank"
          rules={{
            required: '은행을 선택해주세요'
          }}
          render={({ field: { onChange, value } }) => (
            <SelectField
              ref={bankInputRef}
              value={value}
              onChangeValue={onChange}
              onBlur={()=>{}}
              items={BANK_NAMES.map(bank => ({ label: bank, value: bank, title: bank }))}
              placeholder="은행을 선택해주세요"
            />
          )}
        />
        <FormInfo message={errors.bank?.message} isError={!!errors.bank} />
      </View>

      <View className="w-full">
        <FormLabel label="계좌번호" />
        <Controller
          control={control}
          name="accountNumber"
          rules={{
            required: '계좌번호를 입력해주세요',
            pattern: {
              value: /^\d+$/,
              message: '숫자만 입력해주세요'
            },
            minLength: {
              value: 10,
              message: '올바른 계좌번호를 입력해주세요'
            },
            maxLength: {
              value: 14,
              message: '올바른 계좌번호를 입력해주세요'
            }
          }}
          render={({ field: { onChange, value, onBlur } }) => (
            <InputField
              value={value}
              onChangeText={(text) => onChange(text.replace(/[^0-9]/g, ''))}
              onBlur={onBlur}
              placeholder="하이픈(-) 없이 숫자만 입력해주세요"
              keyboardType="number-pad"
              inputMode="numeric"
              returnKeyType="done"
              onSubmitEditing={() => {
                Keyboard.dismiss();
              }}
            />
          )}
        />
        <FormInfo message={errors.accountNumber?.message || '고객님의 개인정보는 안전하게 보관되며,\n그룹 멤버들이 고객님께 송금할 때만 공유돼요.'} isError={!!errors.accountNumber} />
      </View>

      <PrimaryButton
        title={isLoading || isBankVerifying ? '처리중...' : isEdit ? '정보 수정' : '가입 완료'}
        className="my-4"
        onPress={handleSubmit(onSubmit)}
        disabled={!isFormValid}
        loading={isLoading || isBankVerifying}
      />
    </View>
  );
}; 