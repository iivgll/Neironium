import { useEffect, RefObject } from "react";

interface UseAutoResizeOptions {
  minHeight?: number;
  maxHeight?: number;
}

export const useAutoResize = (
  ref: RefObject<HTMLTextAreaElement>,
  value: string,
  options: UseAutoResizeOptions = {},
) => {
  const { minHeight = 48, maxHeight = 360 } = options;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // If value is empty, reset to min height
    if (!value) {
      element.style.height = `${minHeight}px`;
      return;
    }

    // Reset to min height first to calculate proper scrollHeight
    element.style.height = `${minHeight}px`;

    // Then calculate actual needed height
    const scrollHeight = element.scrollHeight;

    // Only expand if content requires it
    if (scrollHeight > minHeight) {
      const newHeight = Math.min(scrollHeight, maxHeight);
      element.style.height = `${newHeight}px`;
    }
  }, [value, minHeight, maxHeight, ref]);

  const resetHeight = () => {
    if (ref.current) {
      ref.current.style.height = `${minHeight}px`;
    }
  };

  return { resetHeight };
};
