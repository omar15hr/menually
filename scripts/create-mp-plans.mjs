/**
 * Script para crear los 4 planes de suscripción (preapproval_plan) en Mercado Pago.
 *
 * EJECUTAR UNA SOLA VEZ como parte del setup inicial.
 *
 * Uso:
 *   1. Configurá MP_ACCESS_TOKEN en tu .env
 *   2. Ejecutá: node scripts/create-mp-plans.mjs
 *   3. Copiá los IDs impresos en tu .env
 *
 * Requiere: Node.js 18+ (usa fetch nativo)
 *           MP_ACCESS_TOKEN en .env (TEST-xxx para sandbox, APP_USR-xxx para prod)
 */

const MP_API_BASE = "https://api.mercadopago.com";

// Leer TODAS las variables de .env
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "..", ".env");

// Cargar .env en process.env (solo las vars que no estén ya definidas)
try {
  const envContent = readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
} catch {
  console.warn("⚠️  No se pudo leer .env, usando solo variables de entorno del sistema");
}

const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;

if (!ACCESS_TOKEN) {
  console.error("❌ MP_ACCESS_TOKEN no está definido en .env ni en process.env");
  console.error("   Obtenelo en: https://www.mercadopago.cl/developers/panel/app");
  console.error("   Formato en .env: MP_ACCESS_TOKEN=TEST-1234...");
  process.exit(1);
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://menually.cl";

const PLANS = [
  {
    reason: "Menually Plan Básico Mensual",
    frequency_type: "months",
    transaction_amount: 24990,
    envVar: "MP_PLAN_BASIC_MONTHLY_ID",
  },
  {
    reason: "Menually Plan Básico Anual",
    frequency_type: "months",
    frequency: 12,
    transaction_amount: 254990,
    envVar: "MP_PLAN_BASIC_ANNUAL_ID",
  },
  {
    reason: "Menually Plan Pro Mensual",
    frequency_type: "months",
    transaction_amount: 29990,
    envVar: "MP_PLAN_PRO_MONTHLY_ID",
  },
  {
    reason: "Menually Plan Pro Anual",
    frequency_type: "months",
    frequency: 12,
    transaction_amount: 305990,
    envVar: "MP_PLAN_PRO_ANNUAL_ID",
  },
];

async function createPlan(config) {
  const body = {
    reason: config.reason,
    auto_recurring: {
      frequency: config.frequency || 1,
      frequency_type: config.frequency_type,
      transaction_amount: config.transaction_amount,
      currency_id: "CLP",
    },
    back_url: `${SITE_URL}/onboarding`,
    payment_methods_allowed: {
      payment_types: [{ id: "credit_card" }, { id: "debit_card" }],
    },
  };

  const response = await fetch(`${MP_API_BASE}/preapproval_plan`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error(
      `❌ Error creando ${config.reason}: HTTP ${response.status}`,
    );
    console.error(`   ${JSON.stringify(data, null, 2)}`);
    return null;
  }

  console.log(`✅ ${config.reason}`);
  console.log(`   ID: ${data.id}`);
  console.log(`   Agregá a .env: ${config.envVar}=${data.id}`);
  console.log("");
  return data.id;
}

async function main() {
  console.log("🚀 Creando planes de suscripción en Mercado Pago...");
  console.log(`   API: ${MP_API_BASE}`);
  console.log("");

  const ids = {};

  for (const plan of PLANS) {
    const id = await createPlan(plan);
    if (id) {
      ids[plan.envVar] = id;
    }
  }

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📋 Resumen — Agregá esto a tu .env:");
  console.log("");
  for (const [key, value] of Object.entries(ids)) {
    console.log(`${key}=${value}`);
  }
  console.log("");
  console.log("✅ ¡Listo! Los planes ya existen en Mercado Pago.");
  console.log("   Ahora podés crear suscripciones de usuarios.");
}

main().catch((err) => {
  console.error("❌ Error inesperado:", err);
  process.exit(1);
});
