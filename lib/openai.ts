import OpenAI from "openai";

/**
 * Creates an OpenAI client instance using the API key from environment variables.
 * Uses OPENAI_APIKEY (without underscore) to match existing .env convention.
 */
export function createOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_APIKEY;

  if (!apiKey) {
    throw new Error(
      "OPENAI_APIKEY environment variable is not set. " +
        "Please add it to your .env file."
    );
  }

  return new OpenAI({
    apiKey,
  });
}
