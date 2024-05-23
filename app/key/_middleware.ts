// pages/key/_middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
	const referer = req.headers.get('referer');
	const allowedReferer = 'https://xenon-next-js-seven.vercel.app/';

	if (!referer || !referer.startsWith(allowedReferer)) {
		return NextResponse.redirect('https://xenon-next-js-seven.vercel.app/');
	}

	return NextResponse.next();
}
