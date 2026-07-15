import type { ReportType } from '@prisma/client';
import { env } from '../config/env.js';
import { AppError } from '../middleware/errors.js';
import type { CollectionError, NormalizedItem } from '../types/normalized.js';
import { logger } from '../utils/logger.js';
import { getSystemPrompt } from '../reports/prompts.js';

export interface OpenRouterConfig {
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  timeoutMs: number;
  maxRetries: number;
}

function getConfig(): OpenRouterConfig {
  return {
    apiKey: env.OPENROUTER_API_KEY,
    model: env.OPENROUTER_MODEL,
    temperature: env.OPENROUTER_TEMPERATURE,
    maxTokens: env.OPENROUTER_MAX_TOKENS,
    timeoutMs: 60_000,
    maxRetries: 3,
  };
}

async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}

export async function generateReport(
  type: ReportType,
  items: NormalizedItem[],
  errors: CollectionError[] = [],
): Promise<string> {
  const config = getConfig();
  if (!config.apiKey) {
    throw new AppError(503, 'OpenRouter API key is not configured', 'AI_NOT_CONFIGURED');
  }

  const body = {
    model: config.model,
    temperature: config.temperature,
    max_tokens: config.maxTokens,
    messages: [
      { role: 'system', content: getSystemPrompt(type) },
      {
        role: 'user',
        content: JSON.stringify({
          reportType: type,
          generatedAt: new Date().toISOString(),
          itemCount: items.length,
          items,
          errors,
          notes:
            errors.length > 0
              ? 'Some data sources failed. Treat those as unavailable, not empty activity.'
              : undefined,
        }),
      },
    ],
  };

  let lastError: unknown;
  for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), config.timeoutMs);
    try {
      logger.info({ type, attempt, model: config.model }, 'OpenRouter request');
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': env.FRONTEND_URL,
          'X-Title': 'AI COO',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (res.status === 429 || res.status >= 500) {
        lastError = new Error(`OpenRouter HTTP ${res.status}`);
        await sleep(500 * 2 ** (attempt - 1));
        continue;
      }

      if (!res.ok) {
        const text = await res.text();
        throw new AppError(502, `OpenRouter error: ${text.slice(0, 200)}`, 'AI_ERROR');
      }

      const json = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const content = json.choices?.[0]?.message?.content;
      if (!content) {
        throw new AppError(502, 'OpenRouter returned empty content', 'AI_EMPTY');
      }
      return content;
    } catch (err) {
      lastError = err;
      if (err instanceof AppError) throw err;
      logger.warn({ err, attempt }, 'OpenRouter attempt failed');
      await sleep(500 * 2 ** (attempt - 1));
    } finally {
      clearTimeout(timer);
    }
  }

  logger.error({ lastError }, 'OpenRouter exhausted retries');
  throw new AppError(502, 'OpenRouter request failed after retries', 'AI_FAILED');
}
