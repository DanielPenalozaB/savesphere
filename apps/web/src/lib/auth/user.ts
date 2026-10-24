/** The signed-in user as returned by `GET /api/me`. */
export interface SessionUser {
	id: string;
	email: string;
	name: string;
}
