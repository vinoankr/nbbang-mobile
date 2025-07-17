import React, { useState, forwardRef } from "react";
import { TextInput, StyleSheet, TextInputProps } from "react-native";

interface InputFieldProps extends TextInputProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
}

export const InputField = forwardRef<TextInput, InputFieldProps>(
  ({ placeholder, value, onChangeText, onBlur, ...rest }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    const handleBlur = (e: any) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    return (
      <TextInput
        ref={ref}
        style={[
          styles.input,
          isFocused && { borderColor: "#2C7FFF" }
        ]}
        placeholder={placeholder}
        placeholderTextColor="#9C9DA4"
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={handleBlur}
        {...rest}
      />
    );
  }
);

InputField.displayName = 'InputField';

const styles = StyleSheet.create({
  input: {
    fontFamily: "Pretendard-500",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#EEEFF3",
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: "#30333D",
    backgroundColor: "#FFF",
    fontSize: 16,
    fontWeight: "500",
  },
});