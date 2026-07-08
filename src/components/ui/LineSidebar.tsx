import React, { useRef, useCallback, useEffect } from 'react';
import './LineSidebar.css';

const FALLOFF_CURVES = {
  linear: (p: number) => p,
  smooth: (p: number) => p * p * (3 - 2 * p),
  sharp: (p: number) => p * p * p
};

export interface LineSidebarItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
}

interface LineSidebarProps {
  items: LineSidebarItem[];
  activeId?: string;
  onSelect?: (id: string, index: number) => void;
  accentColor?: string;
  textColor?: string;
  markerColor?: string;
  showIndex?: boolean;
  showMarker?: boolean;
  proximityRadius?: number;
  maxShift?: number;
  falloff?: 'linear' | 'smooth' | 'sharp';
  markerLength?: number;
  markerGap?: number;
  tickScale?: number;
  scaleTick?: boolean;
  itemGap?: number;
  fontSize?: number;
  /** Time-constant for the hover-driven effect (snappy). Default 90ms. */
  hoverSmoothing?: number;
  /** Time-constant for the active-item glide (smooth). Default 750ms. */
  activeSmoothing?: number;
  /**
   * Backward-compat alias. If set and the new props are not, this is used as both.
   * @deprecated prefer hoverSmoothing/activeSmoothing.
   */
  smoothing?: number;
}

export const LineSidebar: React.FC<LineSidebarProps> = ({
  items,
  activeId,
  onSelect,
  accentColor = '#A855F7',
  textColor = '#c4c4c4',
  markerColor = '#6c6c6c',
  showIndex = true,
  showMarker = true,
  proximityRadius = 100,
  maxShift = 30,
  falloff = 'smooth',
  markerLength = 60,
  markerGap = 0,
  tickScale = 0.5,
  scaleTick = true,
  itemGap = 20,
  fontSize = 14,
  hoverSmoothing,
  activeSmoothing,
  smoothing,
}) => {
  const listRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  // Per-item target from hover (0..1) and current rendered value (0..1)
  const hoverTargetRef = useRef<number[]>([]);
  const currentRef = useRef<number[]>([]);
  // Single floating-point "active position" — represents a position on a continuous index
  // scale (0..N-1), so the marker can glide smoothly from one item to another. The visual
  // marker is drawn as an overlay positioned by this float.
  const activePosRef = useRef<number>(0);
  const activePosTargetRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number>(0);

  // Marker overlay element (a single absolutely-positioned line that travels the list)
  const markerOverlayRef = useRef<HTMLDivElement | null>(null);
  // Active label indicator overlay — moves with the marker and highlights the current label
  const activeLabelOverlayRef = useRef<HTMLDivElement | null>(null);
  // Number-of-items the marker has positions for
  const lastItemsLenRef = useRef<number>(-1);
  // Last known active index
  const lastActiveIdxRef = useRef<number>(-1);

  const activeIndex = items.findIndex(item => item.id === activeId);

  // Resolve smoothing values with sensible fallbacks
  const hoverTau = (hoverSmoothing ?? smoothing ?? 90) / 1000;
  const activeTau = (activeSmoothing ?? smoothing ?? 750) / 1000;

  // On items change or active change, update the active position target
  useEffect(() => {
    if (lastItemsLenRef.current !== items.length) {
      activePosRef.current = activeIndex >= 0 ? activeIndex : 0;
      activePosTargetRef.current = activeIndex >= 0 ? activeIndex : 0;
      lastItemsLenRef.current = items.length;
      lastActiveIdxRef.current = activeIndex;
      return;
    }
    if (lastActiveIdxRef.current !== activeIndex) {
      // New active index — glide there
      if (activeIndex >= 0) {
        activePosTargetRef.current = activeIndex;
      }
      lastActiveIdxRef.current = activeIndex;
    }
  }, [activeId, items, activeIndex]);

  const runFrame = useCallback(
    (now: number) => {
      const dt = Math.min((now - lastRef.current) / 1000, 0.05);
      lastRef.current = now;

      const kHover = 1 - Math.exp(-dt / hoverTau);
      const kActive = 1 - Math.exp(-dt / activeTau);

      let moving = false;
      const itemEls = itemRefs.current;
    

      // --- Active glide: interpolate activePos toward activePosTarget ---
      const activeDelta = activePosTargetRef.current - activePosRef.current;
      const activeNext = activePosRef.current + activeDelta * kActive;
      const activeSettled = Math.abs(activeDelta) < 0.0015;
      const activeValue = activeSettled ? activePosTargetRef.current : activeNext;
      activePosRef.current = activeValue;
      if (!activeSettled) moving = true;

      // --- Render the marker overlay: position by activeValue ---
      const overlay = markerOverlayRef.current;
      if (overlay && itemEls.length > 0 && activeValue >= 0 && activeValue < itemEls.length) {
        const lo = Math.floor(activeValue);
        const hi = Math.min(lo + 1, itemEls.length - 1);
        const frac = activeValue - lo;
        const a = itemEls[lo];
        const b = itemEls[hi];
        if (a && b) {
          const aTop = a.offsetTop;
          const aHeight = a.offsetHeight;
          const bTop = b.offsetTop;
          const bHeight = b.offsetHeight;
          const top = aTop + (bTop - aTop) * frac;
          const height = aHeight + (bHeight - aHeight) * frac;
          overlay.style.transform = `translateY(${top}px)`;
          overlay.style.height = `${height}px`;
          overlay.style.opacity = '1';
        }
      } else if (overlay) {
        overlay.style.opacity = '0';
      }

      // --- Active label overlay: highlight the current active item's label color/transform ---
      // Find the nearest integer index to activeValue
      const nearestIdx = Math.round(activeValue);
      const labelOverlay = activeLabelOverlayRef.current;
      if (labelOverlay && nearestIdx >= 0 && nearestIdx < itemEls.length) {
        const target = itemEls[nearestIdx];
        if (target) {
          labelOverlay.style.transform = `translateY(${target.offsetTop}px)`;
          labelOverlay.style.height = `${target.offsetHeight}px`;
          labelOverlay.style.opacity = activeSettled ? '0' : '0.0';
        }
      }

      // --- Per-item hover glide ---
      for (let i = 0; i < itemEls.length; i++) {
        const el = itemEls[i];
        if (!el) continue;
        const labelEl = el.querySelector('.line-sidebar__label') as HTMLElement | null;
        if (!labelEl) continue;

        // Hover glide (snappy)
        const hoverTarget = hoverTargetRef.current[i] ?? 0;
        const hoverCur = currentRef.current[i] ?? 0;
        const hoverNext = hoverCur + (hoverTarget - hoverCur) * kHover;
        const hoverSettled = Math.abs(hoverTarget - hoverNext) < 0.0008;
        const hoverValue = hoverSettled ? hoverTarget : hoverNext;
        currentRef.current[i] = hoverValue;
        if (!hoverSettled) moving = true;

        // The label's --effect is hover-driven only. The active marker is a separate overlay.
        // BUT we also want the active label to look "highlighted" — that's handled by a CSS
        // class on the active item, not by the --effect variable.
        labelEl.style.setProperty('--effect', hoverValue.toFixed(4));

        // Subtle color tinting on items near the active glide position
        const distFromActive = Math.abs(i - activeValue);
        // For items that are very close to the active position, push their label color towards
        // accent. This creates a soft "wake" trailing the marker.
        if (distFromActive < 1.2) {
          const wake = Math.max(0, 1 - distFromActive / 1.2);
          labelEl.style.setProperty('--active-wake', wake.toFixed(4));
        } else {
          labelEl.style.setProperty('--active-wake', '0');
        }
      }

      if (moving) {
        rafRef.current = requestAnimationFrame(runFrame);
      } else {
        rafRef.current = null;
      }
    },
    [hoverTau, activeTau]
  );

  const startLoop = useCallback(() => {
    if (rafRef.current === null) {
      lastRef.current = performance.now();
      rafRef.current = requestAnimationFrame(runFrame);
    }
  }, [runFrame]);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLUListElement>) => {
      const list = listRef.current;
      if (!list) return;
      const rect = list.getBoundingClientRect();
      const pointerY = e.clientY - rect.top;

      const curveFn = FALLOFF_CURVES[falloff];

      const itemEls = itemRefs.current;
      for (let i = 0; i < itemEls.length; i++) {
        const el = itemEls[i];
        if (!el) continue;
        const elTop = el.offsetTop;
        const elHeight = el.offsetHeight;
        const center = elTop + elHeight / 2;
        const distance = Math.abs(pointerY - center);
        const p = Math.max(0, 1 - distance / proximityRadius);
        hoverTargetRef.current[i] = curveFn(p);
      }
      startLoop();
    },
    [falloff, proximityRadius, startLoop]
  );

  const handlePointerLeave = useCallback(() => {
    hoverTargetRef.current = hoverTargetRef.current.map(() => 0);
    startLoop();
  }, [startLoop]);

  useEffect(() => {
    // Initialize target/current arrays
    if (hoverTargetRef.current.length !== items.length) {
      hoverTargetRef.current = items.map(() => 0);
    }
    if (currentRef.current.length !== items.length) {
      currentRef.current = items.map(() => 0);
    }
    startLoop();
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [items, startLoop]);

  const handleItemClick = useCallback(
    (id: string, index: number) => {
      // Trigger active glide to the clicked item
      activePosTargetRef.current = index;
      lastActiveIdxRef.current = index;
      startLoop();
      onSelect?.(id, index);
    },
    [onSelect, startLoop]
  );

  const cssVars = {
    '--accent-color': accentColor,
    '--text-color': textColor,
    '--marker-color': markerColor,
    '--marker-length': `${markerLength}px`,
    '--marker-gap': `${markerGap}px`,
    '--tick-scale': tickScale,
    '--max-shift': `${maxShift}px`,
    '--item-gap': `${itemGap}px`,
    '--font-size': `${fontSize}px`,
    '--smoothing': `${Math.round(hoverTau * 1000)}ms`,
    '--active-smoothing': `${Math.round(activeTau * 1000)}ms`,
  } as React.CSSProperties;

  // Compute the static marker line segments (the thin horizontal lines between items).
  // These stay static — only the active highlight glides.

  return (
    <ul
      ref={listRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`line-sidebar ${showMarker ? 'line-sidebar--markers' : ''} ${scaleTick ? 'line-sidebar--scale-tick' : ''} w-full py-2`}
      style={cssVars}
    >
      {/* Active marker overlay — a single element that glides between items. */}
      {showMarker && (
        <div
          ref={markerOverlayRef}
          className="line-sidebar__active-marker"
          aria-hidden="true"
        />
      )}

      {items.map((item, index) => {
        const isActive = activeId === item.id;
        const Icon = item.icon;
        return (
          <li
            key={item.id}
            ref={(el) => { itemRefs.current[index] = el; }}
            className="line-sidebar__item"
            data-active={isActive ? 'true' : undefined}
            onClick={() => handleItemClick(item.id, index)}
          >
            <span className="line-sidebar__label">
              {showIndex && (
                <span className="line-sidebar__index">
                  {String(index + 1).padStart(2, '0')}
                </span>
              )}
              {Icon && <Icon size={14} strokeWidth={isActive ? 2 : 1.5} className="line-sidebar__icon shrink-0 mr-2.5" />}
              <span className="line-sidebar__text">{item.label}</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
};

export default LineSidebar;
