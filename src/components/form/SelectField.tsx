import React, { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { View, TouchableOpacity, Platform } from "react-native";
import { MenuView, MenuAction, MenuComponentRef } from "@react-native-menu/menu";
import ChevronDown from "../.././../assets/icons/chevron-down.svg";
import { MediumText } from "../Texts";

interface SelectFieldProps {
  placeholder?: string;
  value: string | null;
  onChangeValue: (value: string | null) => void;
  items: { label: string; value: string }[];
  disabled?: boolean;
  onBlur?: () => void;
}

export const SelectField = forwardRef<any, SelectFieldProps>(
  ({ placeholder, value, onChangeValue, items,
    disabled = false, onBlur, ...rest }, ref) => {

  const menuRef = useRef<MenuComponentRef>(null);
  const [isPressed, setIsPressed] = useState(false);

  useImperativeHandle(ref, () => ({
    focus: () => {
      if (Platform.OS === "android") {
        menuRef.current?.show();
      }
    },
  }));

  const actions: MenuAction[] = items.map((item) => ({
    id: item.value,
    title: item.label,
    subtitle: undefined,
    state: value === item.value ? "on" : "off",
    attributes: {
      destructive: false,
      disabled: false,
      hidden: false,
    },
  }));

  const selectedItem = items.find((item) => item.value === value);
  const displayText = selectedItem?.label || placeholder;

  const handlePressAction = (event: { nativeEvent: { event: string } }) => {
    const selectedValue = event.nativeEvent.event;
    onChangeValue(selectedValue);
  };

  if (disabled) {
    return (
      <View className="rounded-lg border border-gray-100 bg-white min-h-[48px] px-4 py-3.5 flex-row items-center justify-between">
        <MediumText className="text-base text-gray-500 flex-1">
          {displayText}
        </MediumText>
      </View>
    );
  }

  return (
    <MenuView
      actions={actions}
      onOpenMenu={() => setIsPressed(true)}
      onCloseMenu={() => setIsPressed(false)}
      onPressAction={handlePressAction}
      shouldOpenOnLongPress={false}
      ref={menuRef}
    >
      <TouchableOpacity 
        className={`rounded-lg border min-h-[48px] px-4 py-3.5 flex-row items-center justify-between bg-white`}
        style={{
          borderColor: isPressed ? '#2C7FFF' : '#EEEFF3',
        }}
        onPress={() => setIsPressed(true)}
      >
        <MediumText className={`text-base flex-1 ${!selectedItem ? 'text-gray-400' : 'text-black'}`}>
          {displayText}
        </MediumText>
        <ChevronDown width={16} height={16} />
      </TouchableOpacity>
    </MenuView>
  );
})

SelectField.displayName = 'SelectField';