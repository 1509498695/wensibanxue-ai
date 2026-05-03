export function tryParseJson<T = unknown>(value: string): T | null {
  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

function stripCodeFence(value: string) {
  const trimmed = value.trim()
  const fencedMatch = /^```(?:json|JSON)?\s*([\s\S]*?)\s*```$/i.exec(trimmed)

  if (fencedMatch) {
    return fencedMatch[1].trim()
  }

  return trimmed
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()
}

function normalizeQuotedNewlines(value: string) {
  let normalized = ''
  let inString = false
  let escaped = false

  for (const char of value) {
    if (escaped) {
      normalized += char
      escaped = false
      continue
    }

    if (char === '\\' && inString) {
      normalized += char
      escaped = true
      continue
    }

    if (char === '"') {
      normalized += char
      inString = !inString
      continue
    }

    if (inString && char === '\n') {
      normalized += '\\n'
      continue
    }

    if (inString && char === '\r') {
      continue
    }

    if (inString && char === '\t') {
      normalized += '\\t'
      continue
    }

    normalized += char
  }

  return normalized
}

export function cleanJsonText(value: string) {
  return normalizeQuotedNewlines(
    stripCodeFence(value)
      .replace(/^\uFEFF/, '')
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      .replace(/[“”]/g, '"')
      .replace(/[‘’]/g, '"')
      .replace(/，(?=\s*["}\]])/g, ',')
      .replace(/,\s*([}\]])/g, '$1')
      .trim(),
  )
}

export function extractJsonObject(value: string) {
  const cleaned = cleanJsonText(value)
  const objectStart = cleaned.indexOf('{')
  const arrayStart = cleaned.indexOf('[')
  const starts = [objectStart, arrayStart].filter((index) => index >= 0)

  if (starts.length === 0) {
    return null
  }

  const start = Math.min(...starts)
  const stack: string[] = []
  let inString = false
  let escaped = false

  for (let index = start; index < cleaned.length; index += 1) {
    const char = cleaned[index]

    if (escaped) {
      escaped = false
      continue
    }

    if (char === '\\') {
      escaped = inString
      continue
    }

    if (char === '"') {
      inString = !inString
      continue
    }

    if (inString) {
      continue
    }

    if (char === '{') {
      stack.push('}')
      continue
    }

    if (char === '[') {
      stack.push(']')
      continue
    }

    if ((char === '}' || char === ']') && stack[stack.length - 1] === char) {
      stack.pop()

      if (stack.length === 0) {
        return cleaned.slice(start, index + 1)
      }
    }
  }

  return null
}

export function safeJsonParse<T = unknown>(value: string): T | null {
  const directResult = tryParseJson<T>(value)

  if (directResult !== null) {
    return directResult
  }

  const cleaned = cleanJsonText(value)
  const cleanedResult = tryParseJson<T>(cleaned)

  if (cleanedResult !== null) {
    return cleanedResult
  }

  const extracted = extractJsonObject(cleaned)

  if (!extracted) {
    return null
  }

  return tryParseJson<T>(extracted)
}
