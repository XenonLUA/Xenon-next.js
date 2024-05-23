// utils.ts
export const generateRandomKey = (): string => {
	return (
		"XENONHUB_" +
		Math.random().toString(36).substring(2, 15) +
		Math.random().toString(36).substring(2, 15)
	);
};
