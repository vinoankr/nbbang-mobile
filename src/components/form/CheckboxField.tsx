import React from 'react';
import { Checkbox } from 'expo-checkbox';

interface CheckboxFieldProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

export const CheckboxField: React.FC<CheckboxFieldProps> = ({
  value,
  onValueChange,
  disabled = false,
}) => {
  return (
    <Checkbox
      value={value}
      onValueChange={onValueChange}
      color={value ? '#2C7FFF' : '#D1D5DB'}
      disabled={disabled}
      style={{
        width: 18,
        height: 18,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: value ? '#2C7FFF' : '#D1D5DB',
      }}
    />
  );
}; 