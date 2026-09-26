export type FaqEntry = { id: string; category: string; question: string; answer: string }

export const FALLBACK_ANSWER = 'I currently do not have information regarding this — best if you contact Peter by clicking the "Get in touch with me" button.'

// Note: 'peter' is deliberately NOT a stopword. A query like "Who is Peter?" would
// otherwise strip to zero tokens (who/is/peter all removed) and always fall back,
// even though it's the most basic question the FAQ answers.
const STOPWORDS = new Set(['a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'do', 'does', 'did', 'what', 'who', 'when', 'where', 'why', 'how', 'can', 'could', 'will', 'would', 'you', 'your', 'yourself', 'i', 'me', 'my', 'of', 'in', 'on', 'to', 'for', 'and', 'or', 'with', 'about', 'have', 'has', 'had', 'it', 'its', 'this', 'that', 'tell', 'his', 'her', 'right', 'now', 'see'])

// Small hand-picked map for common paraphrases the FAQ's own vocabulary doesn't share
// (e.g. "job" never appears in the dataset, but "work" does).
const SYNONYMS: Record<string, string> = {
  technologies: 'tech', technology: 'tech', stack: 'tech',
  job: 'work', working: 'work', hiring: 'hire', hired: 'hire', employ: 'hire',
  website: 'portfolio', site: 'portfolio',
  resume: 'cv',
  repo: 'github', repository: 'github',
}

function stem(word: string): string {
  if (word.length > 4 && word.endsWith('es')) return word.slice(0, -2)
  if (word.length > 3 && word.endsWith('s') && !word.endsWith('ss')) return word.slice(0, -1)
  return word
}

function tokenize(text: string): string[] {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/)
    .filter(w => w.length > 1 && !STOPWORDS.has(w))
    .map(stem)
    .map(w => SYNONYMS[w] ?? w)
}

function parseCsv(text: string): FaqEntry[] {
  const rows: string[][] = []
  let field = ''
  let row: string[] = []
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i++ } else { inQuotes = false }
      } else field += ch
    } else if (ch === '"' && field === '') {
      inQuotes = true
    } else if (ch === ',') {
      row.push(field); field = ''
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++
      row.push(field); field = ''
      if (row.some(f => f.trim() !== '')) rows.push(row)
      row = []
    } else field += ch
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row) }
  const [, ...body] = rows
  return body.filter(r => r.length >= 4).map(r => ({ id: r[0].trim(), category: r[1].trim(), question: r[2].trim(), answer: r[3].trim() }))
}

let cache: Promise<FaqEntry[]> | null = null

async function loadFaq(): Promise<FaqEntry[]> {
  if (!cache) cache = fetch('/peterai-faq.csv').then(res => res.text()).then(parseCsv)
  return cache
}

const MATCH_THRESHOLD = 0.18
const CATEGORY_BONUS = 4

export async function answerFromFaq(message: string): Promise<string> {
  const entries = await loadFaq()
  const queryWords = tokenize(message)
  if (queryWords.length === 0) return FALLBACK_ANSWER
  const queryUnique = new Set(queryWords)

  let best: FaqEntry | null = null
  let bestScore = 0
  for (const entry of entries) {
    const questionWords = new Set(tokenize(entry.question))
    const answerWords = new Set(tokenize(entry.answer))
    const categoryWords = new Set(tokenize(entry.category))
    let score = 0
    let hasSubstantiveMatch = false
    for (const w of queryUnique) {
      let matched = 0
      if (questionWords.has(w)) matched = 3
      else if (categoryWords.has(w)) matched = 1.5
      else if (answerWords.has(w)) matched = 0.5
      if (matched > 0) {
        score += matched
        // "peter" alone matches nearly every entry's question, so it can't be the
        // sole evidence for a query that has other, unmatched words in it.
        if (w !== 'peter') hasSubstantiveMatch = true
      }
    }
    // Strong bonus when the query names the entry's own category (e.g. "projects"
    // hitting a category:"projects" row) — this is what disambiguates ties between
    // an entry that only coincidentally shares a word and the actually-relevant one.
    for (const w of queryUnique) {
      if (w !== 'peter' && categoryWords.has(w)) { score += CATEGORY_BONUS; break }
    }
    const eligible = queryUnique.size === 1 || hasSubstantiveMatch
    const normalized = eligible ? score / Math.sqrt(queryUnique.size * (questionWords.size + 1)) : 0
    if (normalized > bestScore) { bestScore = normalized; best = entry }
  }
  return best && bestScore >= MATCH_THRESHOLD ? best.answer : FALLBACK_ANSWER
}
