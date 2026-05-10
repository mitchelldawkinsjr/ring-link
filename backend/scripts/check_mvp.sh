#!/usr/bin/env bash
set -euo pipefail

echo "[1/5] validating required files"
for f in \
  docker-compose.yml \
  .docker/nginx/default.conf \
  api/openapi.yaml \
  backend/database/migrations/2026_05_10_000001_mvp_schema.sql \
  docs/todos.md
  do
  test -f "$f" || { echo "missing $f"; exit 1; }
done

echo "[2/5] schema includes required tables"
for t in users wrestler_profiles promotion_profiles events submissions bookings conversations messages media_links availability_windows verified_booking_reviews notifications saved_talent audit_logs; do
  rg -q "CREATE TABLE ${t}" backend/database/migrations/2026_05_10_000001_mvp_schema.sql || { echo "missing table ${t}"; exit 1; }
done

echo "[3/5] openapi includes core paths"
for p in /auth/register /auth/login /wrestlers /promotions /submissions /bookings /reviews; do
  rg -q "$p" api/openapi.yaml || { echo "missing path $p"; exit 1; }
done

echo "[4/5] workflow states aligned"
rg -q "offer_sent" backend/app/Enums/SubmissionStatus.php
rg -q "in_progress" backend/app/Enums/BookingStatus.php

echo "[5/5] docs include blocker details"
rg -q "CONNECT tunnel failed" docs/todos.md

echo "MVP env checks passed"
