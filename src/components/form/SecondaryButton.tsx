import React from "react";
import { TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { SemiBoldText } from "../Texts";

interface SecondaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export const SecondaryButton: React.FC<SecondaryButtonProps> = ({
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
        (disabled || loading) && { opacity: 0.5 }
      ]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={disabled || loading}
      className={className}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <SemiBoldText className="text-[18px] text-black">{title}</SemiBoldText>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#F6F6FA",
    borderRadius: 12,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
});
