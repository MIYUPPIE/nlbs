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
unset NEXT_PUBLIC_CENTRAL_API_URL NEXT_PUBLIC_CENTRAL_SITE_KEY NEXT_PUBLIC_SITE_URL NEXT_PUBLIC_TALENT_APPLICATIONS_OVERRIDE
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

mkdir -p dist
rm -f "$ZIP"
(cd out && zip -qr -X "../$ZIP" . -x '*.DS_Store')
echo "$ZIP ($(du -h "$ZIP" | cut -f1)), $(find out -name index.html | wc -l) pages"
