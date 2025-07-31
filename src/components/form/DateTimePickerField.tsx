import React, { useState } from 'react';
import { View, TouchableOpacity, Platform, Keyboard } from 'react-native';

import DateTimePickerModal from "react-native-modal-datetime-picker";
import { MediumText } from '../Texts';

interface DateTimePickerFieldProps {
  value: Date;
  onChange: (date: Date) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const DateTimePickerField: React.FC<DateTimePickerFieldProps> = ({
  value,
  onChange,
  placeholder = '날짜 선택',
  disabled = false,
}) => {
  const [show, setShow] = useState(false);

  const handleDateChange = (date: Date) => {
    setShow(false);
    onChange(date);
  };

  const showDatePicker = () => {
    if (!disabled) {
      Keyboard.dismiss();
      setShow(true);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).replace(/\. /g, '.').replace(/\.$/, '');
  };

  return (
    <View>
      <TouchableOpacity
        onPress={showDatePicker}
        disabled={disabled}
        style={{
          position: 'relative',
          borderRadius: 8,
          borderWidth: 1,
          borderColor: show ? '#2C7FFF' : '#EEEFF3',
          paddingHorizontal: 16,
          paddingVertical: 15,
          backgroundColor: disabled ? '#F9FAFB' : '#FFF',
          minHeight: 48,
          justifyContent: 'center',
        }}
        activeOpacity={0.7}
      >
        <MediumText 
          className={`text-base ${
            disabled ? 'text-gray-400' : value ? 'text-black' : 'text-gray-400'
          }`}
        >
          {value ? formatDate(value) : placeholder}
        </MediumText>
        <DateTimePickerModal
          isVisible={show}
          mode="date"
          date={value}
          locale="ko-KR"
          display='inline'
          onConfirm={handleDateChange}
          onCancel={() => setShow(false)}
        />
      </TouchableOpacity>
    </View>
  );
}; 