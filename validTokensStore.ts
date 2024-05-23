// validTokensStore.ts
let validTokens = new Set<string>();

export function addToken(token: string) {
	validTokens.add(token);
}

export function isValidToken(token: string): boolean {
	return validTokens.has(token);
}

export function removeToken(token: string) {
	validTokens.delete(token);
}
