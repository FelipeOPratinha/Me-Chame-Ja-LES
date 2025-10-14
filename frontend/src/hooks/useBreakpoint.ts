import { useWindowDimensions } from "react-native";


/*  Hook que simula os breakpoints do Tailwind CSS.
 
    Baseado nos valores padrão do Tailwind:
    sm: 640px
    md: 768px
    lg: 1024px
    xl: 1280px
    2xl: 1536px 
 */

export function useBreakpoint() {
  const { width } = useWindowDimensions();

  const isSm = width >= 640;
  const isMd = width >= 768;
  const isLg = width >= 1024;
  const isXl = width >= 1280;
  const is2Xl = width >= 1536;

  let current: string = "xs";
  if (is2Xl) current = "2xl";
  else if (isXl) current = "xl";
  else if (isLg) current = "lg";
  else if (isMd) current = "md";
  else if (isSm) current = "sm";

  return {
    width,
    current,
    isXs: width < 640,
    isSm,
    isMd,
    isLg,
    isXl,
    is2Xl,
  };
}
