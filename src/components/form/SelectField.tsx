import React, { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { View, Keyboard, Platform, Pressable } from "react-native";
import { MenuView, MenuAction, MenuComponentRef } from "@react-native-menu/menu";
import ChevronDown from "../.././../assets/icons/chevron-down.svg";
import { MediumText } from "../Texts";

interface SelectFieldProps {
  placeholder?: string;
  value: string | null;
  onChangeValue: (value: string | null) => void;
  items: { label: string; title: string; value: string }[];
  disabled?: boolean;
  onBlur?: () => void;
}

export const SelectField = forwardRef<any, SelectFieldProps>(
  ({ placeholder, value, onChangeValue, items,
    disabled = false, onBlur, ...rest }, ref) => {

  const menuRef = useRef<MenuComponentRef>(null);
  const [isPressed, setIsPressed] = useState(false);

  useImperativeHandle(ref, () => ({
    focus: () => {},
  }));

  const actions: MenuAction[] = items.map((item) => ({
    id: item.value,
    title: item.title,
    subtitle: undefined,
    state: value === item.value ? "on" : Platform.OS === "ios" ? "off" : "mixed",
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
      <View className="rounded-lg border border-gray-100 bg-gray-50 min-h-[48px] px-4 py-3.5 flex-row items-center justify-between">
        <MediumText 
          className="text-base text-gray-400 flex-1"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {displayText}
        </MediumText>
        <ChevronDown width={16} height={16} color="#BCBDC3" />
      </View>
    );
  }

  return (
    <MenuView
      actions={actions}
      onOpenMenu={() => {
        Keyboard.dismiss();
        setIsPressed(true);
      }}
      onCloseMenu={() => {
        setIsPressed(false);
        onBlur?.();
      }}
      onPressAction={handlePressAction}
      ref={menuRef}
    >
      <Pressable 
        className={`rounded-lg border min-h-[48px] px-4 py-[15px] flex-row items-center justify-between bg-white`}
        style={{
          borderColor: isPressed ? '#2C7FFF' : '#EEEFF3',
        }}
      >
        <MediumText 
          className={`text-base flex-1 ${!selectedItem ? 'text-gray-400' : 'text-black'}`}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {displayText}
        </MediumText>
        <ChevronDown width={16} height={16} color="#BCBDC3" />
      </Pressable>
    </MenuView>
  );
})

SelectField.displayName = 'SelectField';