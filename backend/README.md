CRYPTOSss
Guarda el estado actual del mercado de las criptomonedas seleccionadas. Evita depender      exclusivamente del estado en memoria volátil del servidor Express y permite recopilar históricos exactos.
{
  "_id": "ObjectId",
  "coinId": "bitcoin",          // ID descriptivo único (ej: "bitcoin")
  "name": "Bitcoin",
  "symbol": "BTC",
  "price": 94820.5,
  "change24h": 3.42,
  "sparkline": [91300, 91800, 92200, 91900, 92700, 93400, 94100, 94820.5], // Arreglo de los últimos valores
  "marketCap": 1860432500000,
  "volume24h": 38450120000,
  "high24h": 95100.0,
  "low24h": 91150.0,
  "updatedAt": "2026-06-05T16:00:00Z"
  "volatilityElasticity": [BAJA, MEDIA, ALTA]
}

SCENARIOS
Almacena tanto los escenarios predefinidos para la simulación como los nuevos escenarios personalizados creadas por el usuario en el formulario "Evento Propio".
{
  "_id": "ObjectId",
  "title": "Aprobación de ETFs en América Latina",
  "type": "political",          // "geographic" | "political" | "social" | "economic"
  "impact": "bullish",          // "bullish" | "bearish" | "volatile"
  "description": "Tres países de Latinoamérica adoptan regulaciones favorables aprobando fondos cotizados (ETF)...",
  "isPredefined": true,         // Permite diferenciar los plantillas por defecto del sistema
  "createdBy": "ObjectId",       // ID del usuario que creó el escenario (opcional, null para predefinidos)
  "createdAt": "2026-06-05T16:00:00Z"
}

PREDICTIONS
Guarda las predicciones calculadas por la inteligencia artificial. Esto previene llamadas duplicadas e innecesarias a la API de Gemini (ahorrando costos de tokens) al guardar en caché predicciones de un activo bajo el mismo escenario.

{
  "_id": "ObjectId",
  "coinId": "bitcoin",
  "scenarioId": "ObjectId",       // Referencia opcional al escenario evaluado
  "scenarioDetails": {            // Copia de los datos del escenario usados para la predicción
    "type": "political",
    "impact": "bullish",
    "description": "Aprobación de ETFs..."
  },
  "currentPriceAtSimulation": 94820.5,
  "predictions": [
    {
      "timeLabel": "T+1h",
      "priceValue": 96210.0,
      "upperBond": 97400.0,
      "lowerBond": 95020.0,
      "confidence": 84
    },
    { "timeLabel": "T+2h", "priceValue": 97100.0, "upperBond": 98600.0, "lowerBond": 95600.0, "confidence": 80 }
    // ... así sucesivamente hasta T+6h
  ],
  "commentary": "Análisis estructurado en Español generado por el Oráculo...",
  "createdAt": "2026-06-05T16:45:32Z"
}

ALERTS
Conserva las alarmas y umbrales de fluctuación que configuran tus usuarios para que no se pierdan al recargar el navegador.
{
  "_id": "ObjectId",
  "userId": "ObjectId",         // Útil si integras autenticación
  "coinId": "bitcoin",
  "coinName": "Bitcoin",
  "condition": "above",         // "above" | "below"
  "value": 96500.0,
  "isActive": true,
  "isTriggered": false,
  "triggeredAt": null,          // Fecha en la que cruzó el límite
  "createdAt": "2026-06-05T16:45:32Z"
}

CHATS
Sostiene el historial del chat interactivo. En MongoDB puedes estructurarlo para guardar las sesiones de conversación completas.
{
  "_id": "ObjectId",
  "sessionId": "session-12345",  // Identificador único de la conversación
  "userId": "ObjectId",          // Referencia al usuario (opcional)
  "messages": [
    {
      "sender": "assistant",
      "text": "🤖 ¡Hola! Soy el asesor de escenarios...",
      "timestamp": "2026-06-05T15:31:32Z"
    },
    {
      "sender": "user",
      "text": "¿Cómo afectan las tasas de la Fed a Ethereum?",
      "timestamp": "2026-06-05T15:32:10Z"
    }
  ],
  "updatedAt": "2026-06-05T15:32:10Z"
}