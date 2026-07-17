#!/bin/bash
# ============================================================
# check-env.sh — Valida que .env contenga todas las variables
# requeridas listadas en env.required
# Fast Recover Admin Panel
# ============================================================

set -e

REQUIRED_FILE="${1:-env.required}"
ENV_FILE="${2:-.env}"

if [ ! -f "$REQUIRED_FILE" ]; then
  echo "❌ Archivo requerido no encontrado: $REQUIRED_FILE"
  exit 1
fi

if [ ! -f "$ENV_FILE" ]; then
  echo "❌ Archivo .env no encontrado: $ENV_FILE"
  exit 1
fi

# Extrae nombres de variables (con o sin signo =)
required_vars=$(grep -E '^[A-Za-z_][A-Za-z0-9_]*' "$REQUIRED_FILE" | sed 's/=.*//' | sort | uniq)
current_vars=$(grep -E '^[A-Za-z_][A-Za-z0-9_]*=' "$ENV_FILE" | cut -d= -f1 | sort | uniq)

missing=$(comm -23 <(echo "$required_vars") <(echo "$current_vars") || true)

if [ -n "$missing" ]; then
  echo ""
  echo "╔══════════════════════════════════════════════════════════════╗"
  echo "║  ❌ DEPLOY BLOQUEADO — Variables faltantes en $ENV_FILE    ║"
  echo "╚══════════════════════════════════════════════════════════════╝"
  echo ""
  echo "Variables que faltan:"
  echo "$missing" | sed 's/^/  - /'
  echo ""
  echo "👉 Pasos para arreglar:"
  echo "   1. SSH a la VPS: cd /home/docker-steven/fastrecover-admin"
  echo "   2. Editá el archivo .env y agregá las variables faltantes"
  echo "   3. Guardá y volvé a pushear (o re-run del workflow)"
  echo ""
  exit 1
fi

echo "✅ Validación de .env exitosa. Todas las variables requeridas están presentes."
