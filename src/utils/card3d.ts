import type { FocusEvent, PointerEvent } from "react";
const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);
const resetCardStyles = (node: HTMLElement) => {
  node.style.removeProperty("--card-rotate-x");
  node.style.removeProperty("--card-rotate-y");
  node.style.removeProperty("--card-translate-y");
  node.style.removeProperty("--card-shadow");
  node.style.removeProperty("--card-depth");
};
export const handleCardPointerMove = (
  event: PointerEvent<HTMLElement>
) => {
  if (event.pointerType !== "mouse" && event.pointerType !== "pen") {
    return;
  }
  const target = event.currentTarget;
  const rect = target.getBoundingClientRect();
  if (!rect.width || !rect.height) {
    return;
  }
  const offsetX = event.clientX - rect.left;
  const offsetY = event.clientY - rect.top;
  if (
    offsetX < 0 ||
    offsetY < 0 ||
    offsetX > rect.width ||
    offsetY > rect.height
  ) {
    resetCardStyles(target);
    return;
  }
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  const rotateY = clamp(((offsetX - centerX) / centerX) * 12, -12, 12);
  const rotateX = clamp(((offsetY - centerY) / centerY) * -12, -12, 12);
  target.style.setProperty("--card-rotate-x", `${rotateX.toFixed(2)}deg`);
  target.style.setProperty("--card-rotate-y", `${rotateY.toFixed(2)}deg`);
  target.style.setProperty("--card-translate-y", "-6px");
  target.style.setProperty(
    "--card-shadow",
    "0 28px 48px rgba(0, 0, 0, 0.45)"
  );
  target.style.setProperty("--card-depth", "18px");
};
export const handleCardPointerLeave = (
  event: PointerEvent<HTMLElement>
) => {
  resetCardStyles(event.currentTarget);
};
export const handleCardFocus = (event: FocusEvent<HTMLElement>) => {
  const target = event.currentTarget;
  target.style.setProperty("--card-rotate-x", "0deg");
  target.style.setProperty("--card-rotate-y", "0deg");
  target.style.setProperty("--card-translate-y", "-6px");
  target.style.setProperty(
    "--card-shadow",
    "0 24px 48px rgba(0, 0, 0, 0.4)"
  );
  target.style.setProperty("--card-depth", "18px");
};
export const handleCardBlur = (event: FocusEvent<HTMLElement>) => {
  resetCardStyles(event.currentTarget);
};
