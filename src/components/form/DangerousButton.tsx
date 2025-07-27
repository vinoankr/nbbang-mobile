import React from "react";
import { TouchableOpacity, StyleSheet, View } from "react-native";
import { SemiBoldText } from "../Texts";
import Spinner from "../Spinner";

interface DangerousButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export const  DangerousButton: React.FC<DangerousButtonProps> = ({
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
        <Spinner size={24} color="#fff" strokeWidth={2.5} />
      ) : (
        <View className="flex-row items-center gap-1.5 justify-center">
          <SemiBoldText className="text-[18px] text-red-500">{title}</SemiBoldText>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#FFE5E5",
    borderRadius: 12,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
});
