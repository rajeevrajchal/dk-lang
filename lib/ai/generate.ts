import {
  APICallError,
  LoadAPIKeyError,
  NoObjectGeneratedError,
  generateObject,
  streamObject,
} from "ai";
import type { z } from "zod";
import { resolveModel } from "./registry";
import type { GenerateOptions, GenerateOutcome } from "@/types";

// One way to ask a model for a typed object.
//
// Every AI feature in this app wants the same thing: a Zod schema in, a valid
// instance of it out, and a clear reason when that could not happen. Before
// this, four files each did that themselves against the Anthropic SDK, each
// with its own error handling and its own idea of what "unavailable" meant.
//
// The outcome type is deliberately not an exception. A failed generation is a
// normal, expected state here — no API key configured is the common case in
// development — and every caller has an authored fallback to reach for. Making
// that a throw would push try/catch into all of them and tempt someone into
// swallowing it.

const classifyError = (err: unknown): { reason: string; retryable: boolean } => {
  if (LoadAPIKeyError.isInstance(err)) {
    return { reason: "no API key configured for this provider", retryable: false };
  }

  if (NoObjectGeneratedError.isInstance(err)) {
    // The model answered but not with something matching the schema. Worth
    // distinguishing from a transport failure — it usually means the prompt
    // and the schema disagree, which is a bug rather than a blip. Still
    // retryable: the caller feeds the validation errors back into the prompt.
    return {
      reason: `model did not return a valid object: ${err.message}`,
      retryable: true,
    };
  }

  if (APICallError.isInstance(err)) {
    // 401/403 is a bad key and 400 is a bad request; neither improves on a
    // second attempt. The SDK's own isRetryable covers rate limits and 5xx.
    const status = err.statusCode;
    const hopeless = status === 400 || status === 401 || status === 403 || status === 404;
    return {
      reason: `API error${status ? ` ${status}` : ""}: ${err.message}`,
      retryable: !hopeless && (err.isRetryable ?? true),
    };
  }

  if (err instanceof Error) {
    // A timeout arrives as an AbortError and is worth another go.
    return { reason: err.message, retryable: err.name === "TimeoutError" || err.name === "AbortError" };
  }
  return { reason: "unknown error", retryable: false };
};

// The output type is inferred FROM the schema rather than supplied alongside
// it. That is not just tidier: the AI SDK's own types branch on whether the
// schema produces an object, and an unconstrained type parameter leaves that
// branch unresolvable.
export const generateStructured = async <S extends z.ZodType<object>>(
  opts: GenerateOptions<S>
): Promise<GenerateOutcome<z.infer<S>>> => {
  const resolved = resolveModel(opts.task, opts.provider);
  if (!resolved) {
    return {
      object: null,
      reason: "no AI provider configured (set ANTHROPIC_API_KEY or OPENAI_API_KEY)",
      retryable: false,
    };
  }

  const { model, provider, config, providerOptions } = resolved;
  const timeout = opts.timeoutMs ?? (config.maxOutputTokens > 20000 ? 240_000 : 90_000);

  const request = {
    model,
    schema: opts.schema,
    system: opts.system,
    prompt: opts.prompt,
    maxOutputTokens: config.maxOutputTokens,
    providerOptions,
    abortSignal: AbortSignal.timeout(timeout),
  };

  // The SDK's parameter type branches on whether the schema's output extends
  // `string` (to pick between object/enum/no-schema modes). That conditional
  // cannot be resolved while the schema is still a type parameter, so a
  // generic wrapper like this one will not typecheck against it however the
  // constraint is written. The cast is confined to this one line, and the
  // function's own signature stays fully typed: callers get z.infer<S> back.
  type ObjectRequest = Parameters<typeof generateObject>[0];

  try {
    if (opts.stream) {
      const result = streamObject(request as unknown as Parameters<typeof streamObject>[0]);
      // Awaiting the whole object: the streaming is what keeps the connection
      // alive on a long generation, not a partial-render feature.
      return { object: (await result.object) as z.infer<S>, provider, retryable: true };
    }

    const { object } = await generateObject(request as unknown as ObjectRequest);
    return { object: object as z.infer<S>, provider, retryable: true };
  } catch (err) {
    const { reason, retryable } = classifyError(err);
    console.warn(`[ai] ${opts.task} failed on ${provider}: ${reason}`);
    return { object: null, reason, provider, retryable };
  }
};
