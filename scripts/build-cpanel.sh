#!/usr/bin/env bash
# Builds the production static site and zips it for cPanel public_html:
#   npm run build:cpanel     ->  dist/nlbs-site-<version>.zip
#
# Uses .env.production only (public NEXT_PUBLIC_* values). Refuses to ship a
# build that points anywhere but the live backend, carries a secret key, or
# is missing the .htaccess rules.
set -euo pipefail
cd "$(dirname "$0")/.."

VERSION="$(git describe --tags --always --dirty 2>/dev/null || date +%Y%m%d%H%M%S)"
ZIP="dist/nlbs-site-$VERSION.zip"

# Never let a developer's shell or .env.local leak into production.
unset NEXT_PUBLIC_CENTRAL_API_URL NEXT_PUBLIC_CENTRAL_SITE_KEY NEXT_PUBLIC_SITE_URL NEXT_PUBLIC_TALENT_APPLICATIONS_OVERRIDE NEXT_PUBLIC_REGISTRATION_OVERRIDE
if [ -f .env.local ]; then mv .env.local .env.local.build-hold; trap 'mv .env.local.build-hold .env.local' EXIT; fi

rm -rf out
NODE_ENV=production npx next build

fail() { echo "STOPPED: $*" >&2; exit 1; }
[ -f out/index.html ] || fail "out/index.html missing"
[ -f out/.htaccess ] || fail "out/.htaccess missing"
API="$(sed -n 's/^NEXT_PUBLIC_CENTRAL_API_URL=//p' .env.production)"
KEY="$(sed -n 's/^NEXT_PUBLIC_CENTRAL_SITE_KEY=//p' .env.production)"
grep -rqF "$API" out/_next/static || fail "build does not contain the backend URL $API"
grep -rqF "$KEY" out/_next/static || fail "build does not contain the site's public key"
! grep -rqE "localhost:3299|pk_e2e_nlbs" out || fail "test settings found in the build"
! grep -rqE "sk_[A-Za-z0-9]{20,}" out || fail "a secret key is in the build"
# Registration closes at 00:00 on 7 Dec 2026, Lagos (closesAt in src/lib/registration-window.ts).
# The shipped /register must match the deadline: the form before it, the closed notice after it.
CLOSES_AT="$(sed -n 's/^ *closesAt: "\([^"]*\)".*/\1/p' src/lib/registration-window.ts)"
[ -n "$CLOSES_AT" ] || fail "could not read closesAt from src/lib/registration-window.ts"
BUILD_STATE="$(node -e 'process.stdout.write(Date.now() < Date.parse(process.argv[1]) ? "open" : "closed")' "$CLOSES_AT")"
if [ "$BUILD_STATE" = open ]; then
  grep -q 'data-registration="open"' out/register/index.html || fail "/register should be open until $CLOSES_AT"
  grep -q 'Continue to payment' out/register/index.html || fail "/register is missing the registration form"
  [ -f out/register/pay/index.html ] || fail "/register/pay (seat payment page) is missing"
else
  grep -q 'data-registration="closed"' out/register/index.html || fail "/register is not showing 'Registration is closed'"
  ! grep -q 'Continue to payment' out/register/index.html || fail "/register still has the registration form"
fi
echo "registration: $BUILD_STATE (closes $CLOSES_AT)"

mkdir -p dist
rm -f "$ZIP"
(cd out && zip -qr -X "../$ZIP" . -x '*.DS_Store')
echo "$ZIP ($(du -h "$ZIP" | cut -f1)), $(find out -name index.html | wc -l) pages"
