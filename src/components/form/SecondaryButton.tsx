import React from "react";
import { TouchableOpacity, StyleSheet, View, Keyboard } from "react-native";
import { SemiBoldText } from "../Texts";
import Spinner from "../Spinner";

interface SecondaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export const  SecondaryButton: React.FC<SecondaryButtonProps> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  className,
  ...rest
}) => {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      style={[
        styles.button,
        (disabled || loading) && { opacity: 0.5 }
      ]}
      onPress={() => {
        Keyboard.dismiss();
        onPress();
      }}
      activeOpacity={0.8}
      disabled={disabled || loading}
      className={className}
      {...rest}
    >
      {loading ? (
        <Spinner size={24} color="#fff" strokeWidth={2.5} />
      ) : (
        <View className="flex-row items-center gap-1.5 justify-center">
          <SemiBoldText className="text-lg text-black">{title}</SemiBoldText>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#F6F6FA",
    borderRadius: 12,
    height: 56,
    minHeight: 56,
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
});
