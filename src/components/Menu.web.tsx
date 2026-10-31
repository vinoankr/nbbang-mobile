import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import type { MenuComponentProps, MenuComponentRef } from '@react-native-menu/menu';

export type { MenuAction, MenuComponentProps, MenuComponentRef } from '@react-native-menu/menu';

// The native menu package currently renders only its children on web.
export const MenuView = forwardRef<MenuComponentRef, MenuComponentProps>(function MenuView(
  { children, actions, onPressAction, onOpenMenu, onCloseMenu, style, title, testID }, ref,
) {
  const picker = useRef<Picker<string>>(null);
  useImperativeHandle(ref, () => ({ show: () => picker.current?.focus() }));
  const selected = actions.find(action => action.state === 'on')?.id ?? '';
  return (
    <View style={[{ position: 'relative' }, style]} testID={testID}>
      {children}
      <Picker
        ref={picker}
        accessibilityLabel={title || '항목 선택'}
        selectedValue={selected}
        onFocus={onOpenMenu}
        onBlur={onCloseMenu}
        onValueChange={value => onPressAction?.({ nativeEvent: { event: String(value) } })}
        style={[StyleSheet.absoluteFill, { width: '100%', height: '100%', opacity: 0 }]}
      >
        {!selected && <Picker.Item label="선택하세요" value="" enabled={false} />}
        {actions.filter(action => !action.attributes?.hidden).map((action, index) => (
          <Picker.Item key={action.id ?? index} label={action.title} value={action.id ?? String(index)} enabled={!action.attributes?.disabled} />
        ))}
      </Picker>
    </View>
  );
});
