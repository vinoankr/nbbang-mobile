import React from 'react';
import { View } from 'react-native';

interface DateTimePickerFieldProps {
  value: Date;
  onChange: (date: Date) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function DateTimePickerField({ value, onChange, placeholder = '날짜 선택', disabled }: DateTimePickerFieldProps) {
  const dateValue = `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
  return (
    <View>
      <input
        type="date"
        aria-label={placeholder}
        value={dateValue}
        disabled={disabled}
        onChange={event => {
          const [year, month, day] = event.target.value.split('-').map(Number);
          if (year && month && day) onChange(new Date(year, month - 1, day));
        }}
        style={{ width: '100%', minWidth: 0, boxSizing: 'border-box', height: 52, borderRadius: 8, border: '1px solid #EEEFF3', padding: '12px 16px', fontFamily: 'Pretendard-500', fontSize: 16, color: '#30333D', backgroundColor: disabled ? '#F9FAFB' : '#fff' }}
      />
    </View>
  );
}
