import React from "react";
import { TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { SemiBoldText } from "../Texts";

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  className,
  ...rest
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        (disabled || loading) && { opacity: 0.5 },
      ]}
      className={className}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <SemiBoldText className="text-[18px] text-white">{title}</SemiBoldText>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#2C7FFF",
    borderRadius: 12,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
});
