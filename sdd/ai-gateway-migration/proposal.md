# Proposal: Migrate OpenAI Integration to Vercel AI Gateway

## Intent

Migrar de llamadas directas a OpenAI API hacia Vercel AI Gateway para obtener:
- **Gestión centralizada de claves**: La API key no queda expuesta en el código
- **Analytics y monitoreo**: Ver uso, costos y métricas en dashboard de Vercel
- **Controles de costo**: Rate limits y budgets configurables
- **Caching**: Respuestas cacheadas para requests repetidos
- **Retry logic**: Reintentos automáticos en caso de fallos

## Scope

### In Scope
- Modificar `lib/openai.ts` para usar AI Gateway como proxy
- Agregar variable `AI_GATEWAY_URL` al environment
- Mantener backward compatibility con API directa (opcional)
- Actualizar documentación de configuración

### Out of Scope
- Cambiar el modelo (se mantiene `gpt-4o-mini`)
- Modificar el flujo de procesamiento de menú
- Agregar features adicionales de AI Gateway (caching avanzado, fallbacks)

## Approach

El SDK de `ai` (Vercel) soporta AI Gateway nativamente a través del parámetro `baseURL`.

```typescript
// lib/openai.ts - Configuración con AI Gateway
import { AI } from "ai";

export function createAIClient() {
  const gatewayUrl = process.env.VERCEL_AI_GATEWAY_URL;
  const apiKey = process.env.OPENAI_APIKEY;

  return new AI({
    baseURL: gatewayUrl || "https://api.openai.com/v1",
    apiKey,
  });
}
```

En `actions/ai-process-menu.action.ts`, el código actual usa `streamText` de `"ai"`. La migración requiere cambiar a cliente HTTP directo:

```typescript
import { createAIClient } from "@/lib/openai";

export async function processMenuAI(formData: FormData) {
  const ai = createAIClient();
  
  const response = await ai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [...],
    max_tokens: 4096,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  // ... rest of parsing logic
}
```

**Nota**: El código actual YA usa el paquete `ai` de Vercel con `streamText`. AI Gateway permite mantener la misma interfaz.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `lib/openai.ts` | Modified | Agregar soporte para AI Gateway URL |
| `actions/ai-process-menu.action.ts` | Modified | Usar cliente HTTP en lugar de streamText |
| `.env.example` | Modified | Agregar `VERCEL_AI_GATEWAY_URL` |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Timeout por latencia adicional del proxy | Low | AI Gateway está geo-distribuido, usar edge |
| Breaking change en API de `ai` package | Low | Mantener tests y monitoreo |
| Configuración incorrecta de URL | Medium | Validar formato de URL en startup |

## Rollback Plan

1. Remover `VERCEL_AI_GATEWAY_URL` del env
2. Revertir `lib/openai.ts` a usar `baseURL` default de OpenAI
3. Cambiar de vuelta a `streamText` en action
4. Deploy en < 5 minutos

## Dependencies

- Vercel AI Gateway account configurado (listo por el usuario)
- `VERCEL_AI_GATEWAY_URL` env variable

## Success Criteria

- [ ] AI Gateway recibe requests exitosamente
- [ ] Dashboard de Vercel muestra métricas de uso
- [ ] Rollback testeado y documentado
- [ ] Backward compatibility mantenida (si se implementa dual mode)