export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

export const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.6 } },
};

export const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

export const cinematic = {
  hidden: { opacity: 0, y: 60, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
  },
};
