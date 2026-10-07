"use client";

import {
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useRef,
  useState,
  type FocusEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

import {
  ITEM_NAME_COLORS,
  type ItemTooltipItem,
} from "@/constants/item-tooltip";
import { cn } from "@/lib/utils";

export {
  ITEM_NAME_COLORS,
  ITEM_REQUIREMENT_COLOR,
  type ItemQuality,
  type ItemTooltipItem,
  type ItemTooltipLine,
} from "@/constants/item-tooltip";

const CURSOR_GAP = 16;
const VIEWPORT_PAD = 8;
const CLOSE_EVENT = "d2:item-tooltip-close";

type Point = { x: number; y: number };

type HoverTargetProps = {
  className?: string;
  tabIndex?: number;
  onMouseEnter?: (event: MouseEvent<HTMLElement>) => void;
  onMouseMove?: (event: MouseEvent<HTMLElement>) => void;
  onMouseLeave?: (event: MouseEvent<HTMLElement>) => void;
  onPointerEnter?: (event: PointerEvent<HTMLElement>) => void;
  onPointerMove?: (event: PointerEvent<HTMLElement>) => void;
  onPointerLeave?: (event: PointerEvent<HTMLElement>) => void;
  onFocus?: (event: FocusEvent<HTMLElement>) => void;
  onBlur?: (event: FocusEvent<HTMLElement>) => void;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  "aria-describedby"?: string;
};

function canHover() {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

function place(anchor: Point, size: { width: number; height: number }) {
  const maxX = window.innerWidth - size.width - VIEWPORT_PAD;
  const maxY = window.innerHeight - size.height - VIEWPORT_PAD;
  let x = anchor.x + CURSOR_GAP;
  let y = anchor.y + CURSOR_GAP;

  if (x > maxX) x = anchor.x - CURSOR_GAP - size.width;
  if (y > maxY) y = anchor.y - CURSOR_GAP - size.height;

  return {
    x: Math.max(VIEWPORT_PAD, Math.min(x, Math.max(VIEWPORT_PAD, maxX))),
    y: Math.max(VIEWPORT_PAD, Math.min(y, Math.max(VIEWPORT_PAD, maxY))),
  };
}

function anchorToElement(element: HTMLElement): Point {
  const rect = element.getBoundingClientRect();
  return { x: rect.left + 12, y: rect.bottom };
}

export function ItemTooltip({
  item,
  children,
}: {
  item: ItemTooltipItem;
  children: ReactNode;
}) {
  const tooltipId = useId();
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement>(null);
  const anchorRef = useRef<Point>({ x: 0, y: 0 });
  const followCursorRef = useRef(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onClose(event: Event) {
      if ((event as CustomEvent<string>).detail !== tooltipId) setOpen(false);
    }
    window.addEventListener(CLOSE_EVENT, onClose);
    return () => window.removeEventListener(CLOSE_EVENT, onClose);
  }, [tooltipId]);

  useEffect(() => {
    if (!open) return;
    window.dispatchEvent(new CustomEvent(CLOSE_EVENT, { detail: tooltipId }));

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    function onPointerDown(event: Event) {
      if (canHover()) return;
      const target = event.target;
      if (target instanceof Node && triggerRef.current?.contains(target)) return;
      setOpen(false);
    }

    function onScroll() {
      if (followCursorRef.current) {
        setOpen(false);
        return;
      }
      if (!triggerRef.current) return;
      anchorRef.current = anchorToElement(triggerRef.current);
      applyPosition();
    }

    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    applyPosition();

    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [open, tooltipId, item]);

  function applyPosition() {
    const tip = tooltipRef.current;
    if (!tip) return;
    const next = place(anchorRef.current, {
      width: tip.offsetWidth,
      height: tip.offsetHeight,
    });
    tip.style.left = `${next.x}px`;
    tip.style.top = `${next.y}px`;
    tip.style.visibility = "visible";
  }

  function showAt(anchor: Point, element: HTMLElement, followCursor: boolean) {
    triggerRef.current = element;
    followCursorRef.current = followCursor;
    anchorRef.current = anchor;
    setOpen(true);
    applyPosition();
  }

  if (!isValidElement(children)) return children;

  const child = children as ReactElement<HoverTargetProps>;
  const props = child.props;
  const nameColor = ITEM_NAME_COLORS[item.quality ?? "normal"];

  const trigger = cloneElement(child, {
    tabIndex: props.tabIndex ?? 0,
    "aria-describedby": open ? tooltipId : props["aria-describedby"],
    className: cn(
      props.className,
      "focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-[-2px] focus-visible:outline-[#e25c12]",
      open && "bg-[#16120e]",
    ),
    onPointerEnter: (event: PointerEvent<HTMLElement>) => {
      props.onPointerEnter?.(event);
      if (event.pointerType === "touch" || !canHover()) return;
      showAt(
        { x: event.clientX, y: event.clientY },
        event.currentTarget,
        true,
      );
    },
    onPointerMove: (event: PointerEvent<HTMLElement>) => {
      props.onPointerMove?.(event);
      if (event.pointerType === "touch" || !canHover()) return;
      followCursorRef.current = true;
      anchorRef.current = { x: event.clientX, y: event.clientY };
      triggerRef.current = event.currentTarget;
      if (!open) {
        setOpen(true);
        return;
      }
      applyPosition();
    },
    onPointerLeave: (event: PointerEvent<HTMLElement>) => {
      props.onPointerLeave?.(event);
      if (event.pointerType === "touch") return;
      followCursorRef.current = false;
      setOpen(false);
    },
    onFocus: (event: FocusEvent<HTMLElement>) => {
      props.onFocus?.(event);
      if (followCursorRef.current) return;
      showAt(anchorToElement(event.currentTarget), event.currentTarget, false);
    },
    onBlur: (event: FocusEvent<HTMLElement>) => {
      props.onBlur?.(event);
      if (followCursorRef.current) return;
      setOpen(false);
    },
    onClick: (event: MouseEvent<HTMLElement>) => {
      props.onClick?.(event);
      if (canHover()) return;
      const element = event.currentTarget;
      triggerRef.current = element;
      followCursorRef.current = false;
      anchorRef.current = anchorToElement(element);
      setOpen((current) => !current);
    },
  });

  const panel = (
    <div
      ref={tooltipRef}
      id={tooltipId}
      role="tooltip"
      className="d2-tooltip"
      data-item-tooltip=""
    >
      <p className="d2-tooltip-name" style={{ color: nameColor }}>
        {item.name}
      </p>
      {item.lines.map((line, index) => (
        <p
          key={`${index}-${line.text}`}
          className={line.gapBefore ? "d2-tooltip-gap" : undefined}
          style={line.color ? { color: line.color } : undefined}
        >
          {line.text}
        </p>
      ))}
    </div>
  );

  return (
    <>
      {trigger}
      {open ? createPortal(panel, document.body) : null}
    </>
  );
}
