export interface AuthResult {
	success: boolean;
	error?: string;
}

export interface LoginResult extends AuthResult {
	userId?: string;
}
