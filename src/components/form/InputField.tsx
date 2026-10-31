import React, { useState, forwardRef, useRef, useImperativeHandle } from "react";
import { TextInput, StyleSheet, TextInputProps, TextInputInstance, Platform } from "react-native";

interface InputFieldProps extends TextInputProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  selectTextOnFocus?: boolean;
}

export const InputField = forwardRef<any, InputFieldProps>(
  ({ placeholder, value, onChangeText, onBlur, selectTextOnFocus=false, ...rest }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const innerRef = useRef<TextInputInstance>(null);

    const handleBlur = (e: any) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    useImperativeHandle(ref, () => ({
      focus: () => innerRef.current?.focus(),
      blur: ()=> innerRef.current?.blur(),
    }));


    return (
      <TextInput
        ref={innerRef}
        style={[
          styles.input,
          isFocused && { borderColor: "#2C7FFF" }
        ]}
        multiline={false}
        numberOfLines={1}
        textAlignVertical="center"
        placeholder={placeholder}
        placeholderTextColor="#9C9DA4"
        value={value}
        selectTextOnFocus={selectTextOnFocus}
        onChangeText={onChangeText}
        onFocus={() => {
          setIsFocused(true);
        }}
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
    paddingVertical: Platform.OS === "android" ? 0 : 15,
    height: 52,
    color: "#30333D",
    backgroundColor: "#FFF",
    fontSize: 16,
    fontWeight: "500",
    textAlignVertical: 'center',
  },
});
