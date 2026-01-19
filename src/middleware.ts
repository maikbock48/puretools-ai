import { NextRequest, NextResponse } from 'next/server';
import { fallbackLng, languages } from './i18n/settings';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check if the pathname is missing a locale
  const pathnameIsMissingLocale = languages.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  // Redirect if there is no locale
  if (pathnameIsMissingLocale) {
    // Get the preferred language from the Accept-Language header
    const acceptLanguage = request.headers.get('Accept-Language');
    let locale = fallbackLng;

    if (acceptLanguage) {
      const preferredLang = acceptLanguage.split(',')[0].split('-')[0];
      if (languages.includes(preferredLang as typeof languages[number])) {
        locale = preferredLang;
      }
    }

    return NextResponse.redirect(
      new URL(`/${locale}${pathname === '/' ? '' : pathname}`, request.url)
    );
  }
}

export const config = {
  matcher: [
    // Skip all internal paths (_next)
    '/((?!_next|api|favicon.ico|.*\\..*).*)',
  ],
};
