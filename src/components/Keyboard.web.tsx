import React, { ComponentProps, forwardRef, PropsWithChildren, useEffect, useState } from 'react';
import { KeyboardAvoidingView, ScrollView, ScrollViewInstance, View } from 'react-native';

export { KeyboardAvoidingView };
export function KeyboardProvider({ children }: PropsWithChildren) {
  const [height, setHeight] = useState<number>();
  useEffect(() => {
    let firstFrame = 0;
    let secondFrame = 0;
    const update = () => {
      setHeight(window.visualViewport?.height ?? window.innerHeight);
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
      // Wait for the screen's new onLayout bounds before moving the focused field.
      firstFrame = requestAnimationFrame(() => {
        secondFrame = requestAnimationFrame(() => {
          const active = document.activeElement;
          if (active instanceof HTMLElement && active.matches('input, textarea, [contenteditable="true"]')) {
            active.scrollIntoView({ block: 'nearest', inline: 'nearest' });
          }
        });
      });
    };
    const viewport = window.visualViewport;
    window.addEventListener('resize', update);
    viewport?.addEventListener('resize', update);
    document.addEventListener('focusin', update);
    update();
    return () => {
      window.removeEventListener('resize', update);
      viewport?.removeEventListener('resize', update);
      document.removeEventListener('focusin', update);
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
    };
  }, []);
  return <View style={{ flex: 1, minHeight: 0, maxHeight: height }}>{children}</View>;
}

// The browser owns virtual-keyboard resizing and focus scrolling on web.
export const KeyboardAwareScrollView = forwardRef<ScrollViewInstance, ComponentProps<typeof ScrollView> & { bottomOffset?: number }>(
  function KeyboardAwareScrollView({ bottomOffset: _bottomOffset, ...props }, ref) {
    return <ScrollView {...props} ref={ref} />;
  },
);
