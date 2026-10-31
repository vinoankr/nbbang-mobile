export interface LayoutRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface LayoutInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface DisplayRegion {
  kind: 'division' | 'occlusion';
  frame: LayoutRect;
}

/** All coordinates belong to the same screen/provider, in logical points. */
export function getUsableRect(
  size: { width: number; height: number },
  insets: LayoutInsets,
  regions: readonly DisplayRegion[] = [],
): LayoutRect {
  const width = Math.max(0, size.width);
  const height = Math.max(0, size.height);
  const left = Math.min(width, Math.max(0, insets.left));
  const top = Math.min(height, Math.max(0, insets.top));
  const safe = {
    x: left,
    y: top,
    width: Math.max(0, width - left - Math.max(0, insets.right)),
    height: Math.max(0, height - top - Math.max(0, insets.bottom)),
  };
  let candidates = [safe];

  for (const { kind, frame } of regions) {
    if (!Object.values(frame).every(Number.isFinite) || frame.width < 0 || frame.height < 0) continue;
    const gap = kind === 'division' ? 8 : 4;
    const blocked = {
      x: frame.x - gap,
      y: frame.y - gap,
      right: frame.x + frame.width + gap,
      bottom: frame.y + frame.height + gap,
    };

    candidates = candidates.flatMap(rect => {
      const right = rect.x + rect.width;
      const bottom = rect.y + rect.height;
      if (blocked.right <= rect.x || blocked.x >= right || blocked.bottom <= rect.y || blocked.y >= bottom) return [rect];

      const sides: LayoutRect[] = [];
      // A division chooses one side of the fold, even when the hinge is not opaque.
      if (kind === 'occlusion' || frame.height >= frame.width) {
        sides.push(
          { ...rect, width: Math.max(0, blocked.x - rect.x) },
          { ...rect, x: Math.max(rect.x, blocked.right), width: Math.max(0, right - blocked.right) },
        );
      }
      if (kind === 'occlusion' || frame.width > frame.height) {
        sides.push(
          { ...rect, height: Math.max(0, blocked.y - rect.y) },
          { ...rect, y: Math.max(rect.y, blocked.bottom), height: Math.max(0, bottom - blocked.bottom) },
        );
      }
      return sides.filter(side => side.width > 0 && side.height > 0);
    });
  }

  // Stable ties prefer the upper/leading area; resizing never changes route identity.
  return candidates.sort((a, b) => b.width * b.height - a.width * a.height || a.y - b.y || a.x - b.x)[0]
    ?? { ...safe, width: 0, height: 0 };
}
