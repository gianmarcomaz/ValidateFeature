// Reusable motion system with accessibility support
import { useReducedMotion } from "framer-motion";
import { Variants, Transition } from "framer-motion";

/**
 * Get transition config respecting reduced motion preference
 */
export function getTransition(reduceMotion: boolean): Transition {
  if (reduceMotion) {
    return { duration: 0 };
  }
  return {
    type: "spring",
    stiffness: 260,
    damping: 22,
  };
}

/**
 * Fade up animation variant
 */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

/**
 * Fade in animation variant
 */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

/**
 * Stagger container variant
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

/**
 * Scale on tap variant
 */
export const scaleTap = {
  scale: 0.98,
};

/**
 * Get fadeUp variants that respect reduced motion
 */
export function getFadeUpVariants(reduceMotion: boolean): Variants {
  if (reduceMotion) {
    return {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
    };
  }
  return fadeUp;
}

/**
 * Get fadeIn variants that respect reduced motion
 */
export function getFadeInVariants(reduceMotion: boolean): Variants {
  if (reduceMotion) {
    return {
      hidden: { opacity: 1 },
      visible: { opacity: 1 },
    };
  }
  return fadeIn;
}

/**
 * Hook to get reduced motion preference and transition
 */
export function useMotionConfig() {
  const reduceMotion = useReducedMotion() ?? false;
  return {
    reduceMotion,
    transition: getTransition(reduceMotion),
    fadeUp: getFadeUpVariants(reduceMotion),
    fadeIn: getFadeInVariants(reduceMotion),
    staggerContainer: reduceMotion
      ? { hidden: {}, visible: {} }
      : staggerContainer,
  };
}

