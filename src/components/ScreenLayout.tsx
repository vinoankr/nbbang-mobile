import React, { PropsWithChildren, useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ReservedRegionsProvider, useReservedRegions } from 'react-native-reserved-regions';
import { getUsableRect } from '../utils/adaptiveLayout';

type ScreenLayoutProps = PropsWithChildren<{
  variant?: 'content' | 'form' | 'full';
  backgroundColor?: string;
}>;

function ScreenContent({ children, variant = 'content' }: ScreenLayoutProps) {
  const window = useWindowDimensions();
  const [size, setSize] = useState({ width: window.width, height: window.height });
  const insets = useSafeAreaInsets();
  const regions = useReservedRegions();
  const rect = getUsableRect(size, insets, regions);

  return (
    <View
      pointerEvents="box-none"
      style={styles.fill}
      onLayout={({ nativeEvent: { layout } }) => {
        setSize(previous => previous.width === layout.width && previous.height === layout.height
          ? previous : { width: layout.width, height: layout.height });
      }}
    >
      <View pointerEvents="box-none" style={[styles.area, { left: rect.x, top: rect.y, width: rect.width, height: rect.height }]}>
        <View
          testID="screen-content"
          pointerEvents="box-none"
          style={[
            styles.content,
            variant !== 'full' && {
              maxWidth: variant === 'form' ? 560 : 720,
              paddingHorizontal: rect.width >= 600 ? 24 : 16,
            },
          ]}
        >
          {children}
        </View>
      </View>
    </View>
  );
}

/** Owns all four insets. Children must not add the same insets again. */
export default function ScreenLayout({ backgroundColor = '#fff', ...props }: ScreenLayoutProps) {
  return (
    <SafeAreaProvider pointerEvents="box-none" style={[styles.fill, { backgroundColor }]}>
      <ReservedRegionsProvider pointerEvents="box-none" style={styles.fill}>
        <ScreenContent {...props} />
      </ReservedRegionsProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, minHeight: 0 },
  area: { position: 'absolute' },
  content: { flex: 1, minHeight: 0, width: '100%', alignSelf: 'center' },
});
