export const BREAKPOINTS = {
	mobile: 576,
	tablet: 768,
	desktop: 1024,
} as const;

export const isMobileWidth = () => window.innerWidth < BREAKPOINTS.mobile;
