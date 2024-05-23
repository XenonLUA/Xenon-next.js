// validTokensStore.ts
const validTokens: Set<string> = new Set();

export const addToken = (token: string) => {
	validTokens.add(token);
};

export const removeToken = (token: string) => {
	validTokens.delete(token);
};

export const isValidToken = (token: string) => {
	return validTokens.has(token);
};
