export const scrollViewport = { once: true, margin: "0px" };

export const easeOut = [0.22, 1, 0.36, 1];
export const easeInOut = [0.4, 0, 0.2, 1];

export const desktopSpring = {
  type: "spring",
  stiffness: 320,
  damping: 34,
  mass: 0.7,
};

export const mobileEase = {
  duration: 0.22,
  ease: easeInOut,
};

export function isMobileViewport() {
  if (typeof window === "undefined") return false;
  return window.innerWidth < 768;
}

export function motionTransition({ delay = 0, duration = 0.42 } = {}) {
  if (isMobileViewport()) {
    return { ...mobileEase, delay: Math.min(delay, 0.08) };
  }

  return { ...desktopSpring, delay, duration };
}

export const fadeUp = {
  hidden: { opacity: 0, y: 18, transform: "translateZ(0)" },
  visible: { opacity: 1, y: 0, transform: "translateZ(0)" },
};

export const fadeScale = {
  hidden: { opacity: 0, scale: 0.96, transform: "translateZ(0) scale(0.96)" },
  visible: { opacity: 1, scale: 1, transform: "translateZ(0) scale(1)" },
};
