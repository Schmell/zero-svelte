import { ZERO_AUTH_SECRET } from '$env/static/private';
import { SignJWT, createRemoteJWKSet, jwtVerify } from 'jose';

export async function load() {
	async function signJWT(payload: { sub: string }, options: { exp: string }) {
		try {
			const secret = new TextEncoder().encode(ZERO_AUTH_SECRET);
			const alg = 'HS256';
			return new SignJWT(payload)
				.setProtectedHeader({ alg })
				.setExpirationTime(options.exp)
				.setIssuedAt()
				.setSubject(payload.sub)
				.sign(secret);
		} catch (error) {
			throw error;
		}
	}

	const userID = 'usersId457';

	return {
		jwt: await signJWT({ sub: userID }, { exp: '3h' }),
		userID
	};
}
