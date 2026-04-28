import OpenAI from "openai";

/**
 * Creates an OpenAI client instance.
 *
 * Uses Vercel AI Gateway as proxy when AI_GATEWAY_API_KEY is set.
 * AI Gateway provides: centralized key management, analytics, rate limiting, and caching.
 *
 * When AI_GATEWAY_API_KEY is not set, requests go directly to OpenAI.
 */
export function createOpenAIClient(): OpenAI {
  const aiGatewayKey = process.env.AI_GATEWAY_API_KEY;
  const openaiKey = process.env.OPENAI_APIKEY;

  // Use AI Gateway API key if provided, otherwise fall back to OpenAI key
  const apiKey = aiGatewayKey || openaiKey;

  if (!apiKey) {
    throw new Error(
      "Neither AI_GATEWAY_API_KEY nor OPENAI_APIKEY is set. " +
        "Please add one to your .env file.",
    );
  }

  // Configure client - use AI Gateway if key is provided
  const config: ConstructorParameters<typeof OpenAI>[0] = {
    apiKey,
  };

  if (aiGatewayKey) {
    // Vercel AI Gateway uses a fixed URL as proxy
    config.baseURL = "https://ai-gateway.vercel.sh/v1";
  }

  return new OpenAI(config);
}
