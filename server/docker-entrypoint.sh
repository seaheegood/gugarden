#!/bin/sh
chmod -R 755 /app/uploads 2>/dev/null || true
exec node server.js
