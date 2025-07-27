import React from "react";
import { TouchableOpacity, StyleSheet, View, Keyboard } from "react-native";
import { SemiBoldText } from "../Texts";
import Spinner from "../Spinner";

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  icon?: React.ReactNode;
  doubleFlex?: boolean;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  className,
  icon,
  doubleFlex = false,
  ...rest
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        (disabled || loading) && { opacity: 0.5 },
        doubleFlex && { flex: 2 },
      ]}
      className={className}
      onPress={() => {
        Keyboard.dismiss();
        onPress();
      }}
      activeOpacity={0.8}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <Spinner size={24} color="#fff" strokeWidth={2.5} />
      ) : (
        <View className="flex-row items-center gap-1.5 justify-center">
          <SemiBoldText className="text-[18px] text-white">{title}</SemiBoldText>
          {icon ? icon : null}
        </View>
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
    flex: 1,
  },
});
