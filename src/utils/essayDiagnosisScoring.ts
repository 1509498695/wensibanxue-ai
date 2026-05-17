import type { EssayDiagnosisResult } from '../types/results'

export const ESSAY_TOTAL_SCORE = 60
export const ESSAY_DIMENSION_SCORE = 20

export type EssayDimensionGrade = '一等' | '二等' | '三等' | '四等'

export type NormalizedEssayDimension = {
  basis: string
  grade: EssayDimensionGrade
  label: string
  score: number
}

const strictDimensionLabels = ['内容', '表达', '特征']

function clampScore(value: unknown, maxScore: number) {
  const parsed = Number(value)

  if (!Number.isFinite(parsed)) {
    return null
  }

  return Math.max(0, Math.min(maxScore, Math.round(parsed)))
}

export function getEssayDimensionGrade(score: number): EssayDimensionGrade {
  if (score >= 16) {
    return '一等'
  }

  if (score >= 11) {
    return '二等'
  }

  if (score >= 6) {
    return '三等'
  }

  return '四等'
}

function normalizeGrade(score: number): EssayDimensionGrade {
  return getEssayDimensionGrade(score)
}

function getText(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

export function normalizeEssayDiagnosisScores(result: EssayDiagnosisResult) {
  const dimensions = Array.isArray(result.dimensionScores) ? result.dimensionScores : []
  const strictDimensions = strictDimensionLabels.map((label) => {
    const item = dimensions.find((dimension) => (dimension.label || dimension.name) === label)
    const score = clampScore(item?.score ?? item?.value, ESSAY_DIMENSION_SCORE)

    if (!item || score === null) {
      return null
    }

    return {
      label,
      score,
      grade: normalizeGrade(score),
      basis: getText(item.basis) || getText(item.reason) || getText(item.description) || getText(item.text),
    }
  })

  if (strictDimensions.every(Boolean)) {
    const normalizedDimensions = strictDimensions.filter((item): item is NormalizedEssayDimension => Boolean(item))

    return {
      dimensions: normalizedDimensions,
      isStrictStandard: true,
      totalScore: normalizedDimensions.reduce((sum, item) => sum + item.score, 0),
    }
  }

  const legacyDimensions = dimensions
    .map((item, index) => {
      const score = clampScore(item.score ?? item.value, ESSAY_TOTAL_SCORE)
      const label = item.label || item.name || `维度${index + 1}`

      return score === null
        ? null
        : {
            label,
            score,
            grade: getEssayDimensionGrade(Math.round((score / ESSAY_TOTAL_SCORE) * ESSAY_DIMENSION_SCORE)),
            basis: getText(item.basis) || getText(item.reason) || getText(item.description) || getText(item.text),
          }
    })
    .filter((item): item is NormalizedEssayDimension => Boolean(item))
  const totalScore = clampScore(result.totalScore, ESSAY_TOTAL_SCORE)

  return {
    dimensions: legacyDimensions,
    isStrictStandard: false,
    totalScore,
  }
}

export function normalizeEssayDiagnosisResult(result: EssayDiagnosisResult): EssayDiagnosisResult {
  const scoreSummary = normalizeEssayDiagnosisScores(result)

  if (!scoreSummary.isStrictStandard || scoreSummary.totalScore === null) {
    return result
  }

  return {
    ...result,
    totalScore: scoreSummary.totalScore,
    dimensionScores: scoreSummary.dimensions.map((item) => ({
      label: item.label,
      score: item.score,
      grade: item.grade,
      basis: item.basis,
    })),
  }
}

export function scoreToPercent(score: number, maxScore = ESSAY_DIMENSION_SCORE) {
  return Math.round((score / maxScore) * 100)
}
