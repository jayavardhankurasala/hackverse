import { GoogleGenAI } from '@google/genai'
import { z } from 'zod'

export const aiRecommendationSchema = z.object({
  category: z.enum([
    'IT Support',
    'Electrical',
    'Plumbing',
    'Maintenance',
    'Hostel',
    'Transport',
    'Cleaning',
    'Administration',
  ]),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  department: z.string(),
  summary: z.string(),
  reasoning: z.string(),
})

export type AIRecommendation = z.infer<typeof aiRecommendationSchema>

// In-memory cache for fast response times and deduplication
interface CacheEntry {
  data: AIRecommendation
  timestamp: number
}
const aiCache = new Map<string, CacheEntry>()
const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour
const AI_TIMEOUT_MS = 7500 // 7.5s max to avoid UI lag

function getCacheKey(params: { title: string; description: string; location?: string }): string {
  const norm = (s?: string) => (s || '').trim().toLowerCase().replace(/\s+/g, ' ')
  return `${norm(params.title)}|${norm(params.description)}|${norm(params.location)}`
}

/**
 * Server-side analysis of a campus service request using Google Gemini API
 * Includes response caching and strict timeout fallback to guarantee zero UI freezes.
 */
export async function analyzeRequestText(params: {
  title: string
  description: string
  location?: string
  currentCategory?: string
  currentPriority?: string
}): Promise<{ success: boolean; data?: AIRecommendation; error?: string }> {
  // 1. Check in-memory cache
  const cacheKey = getCacheKey(params)
  const cached = aiCache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return {
      success: true,
      data: cached.data,
    }
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey || apiKey.includes('placeholder')) {
    const fallback = getIntelligentFallback(params)
    aiCache.set(cacheKey, { data: fallback, timestamp: Date.now() })
    return {
      success: true,
      data: fallback,
    }
  }

  try {
    const ai = new GoogleGenAI({ apiKey })

    const prompt = `
You are an intelligent campus service request triage assistant for a university facilities and IT system.
Analyze the following student service request and provide structured categorization, priority recommendation, department routing, a concise 1-sentence summary, and the reasoning.

Request Details:
- Title: ${params.title}
- Description: ${params.description}
- Location: ${params.location || 'Campus'}
${params.currentCategory ? `- User selected category: ${params.currentCategory}` : ''}
${params.currentPriority ? `- User selected priority: ${params.currentPriority}` : ''}

Available Categories (MUST choose exactly one):
1. IT Support (computers, Wi-Fi, portals, software, projectors)
2. Electrical (power outlets, lighting, breakers, wiring, appliances)
3. Plumbing (water leaks, taps, toilets, blockages, drains)
4. Maintenance (doors, windows, furniture, locks, walls, ceiling)
5. Hostel (room amenities, beds, cupboards, hostel facilities)
6. Transport (campus shuttles, parking, vehicle services)
7. Cleaning (janitorial, trash, sanitation, spill cleanup)
8. Administration (documentation, ID cards, general admin requests)

Available Priorities:
- LOW: Minor inconvenience, routine maintenance, cosmetic
- MEDIUM: Standard issue affecting single user or room, work still possible
- HIGH: Significant disruption, no power/water in a living area, urgent exam/lab facility
- CRITICAL: Safety hazard, water flood, electrical spark, campus-wide outage

Return ONLY valid JSON matching this exact structure:
{
  "category": "one of the available categories above",
  "priority": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "department": "Name of relevant campus department",
  "summary": "Clear, concise 1-sentence summary of the core issue",
  "reasoning": "Brief 1-sentence justification for the chosen category and priority"
}
`

    // Timeout guard so the UI never hangs
    const generatePromise = ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    })

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Gemini API timeout')), AI_TIMEOUT_MS)
    )

    const response = await Promise.race([generatePromise, timeoutPromise])
    const responseText = response.text?.trim()

    if (!responseText) {
      const fallback = getIntelligentFallback(params)
      return { success: true, data: fallback }
    }

    // Parse JSON safely
    let parsedJson
    try {
      parsedJson = JSON.parse(responseText)
    } catch {
      const cleanJson = responseText.replace(/```json/gi, '').replace(/```/g, '').trim()
      parsedJson = JSON.parse(cleanJson)
    }

    // Validate with Zod
    const validation = aiRecommendationSchema.safeParse(parsedJson)
    if (!validation.success) {
      const fallback = getIntelligentFallback(params)
      return { success: true, data: fallback }
    }

    // Cache valid result
    aiCache.set(cacheKey, { data: validation.data, timestamp: Date.now() })

    return {
      success: true,
      data: validation.data,
    }
  } catch (err: any) {
    console.warn('Gemini AI Analysis Notice, seamless fallback engaged:', err?.message || err)
    const fallback = getIntelligentFallback(params)
    aiCache.set(cacheKey, { data: fallback, timestamp: Date.now() })
    return {
      success: true,
      data: fallback,
    }
  }
}

export function getIntelligentFallback(params: { title: string; description: string; location?: string }): AIRecommendation {
  const text = `${params.title} ${params.description} ${params.location || ''}`.toLowerCase()
  
  if (text.includes('wifi') || text.includes('wi-fi') || text.includes('internet') || text.includes('network') || text.includes('router') || text.includes('connection')) {
    const isCritical = text.includes('entire') || text.includes('all') || text.includes('completely') || text.includes('outage')
    return {
      category: 'IT Support',
      priority: isCritical ? 'CRITICAL' : 'HIGH',
      department: 'IT Support',
      summary: 'Network connectivity disruption and Wi-Fi signal drops reported.',
      reasoning: 'The issue affects internet accessibility required for academic operations.',
    }
  }
  if (text.includes('leak') || text.includes('pipe') || text.includes('water') || text.includes('tap') || text.includes('drain') || text.includes('toilet') || text.includes('bathroom') || text.includes('sink')) {
    return {
      category: 'Plumbing',
      priority: 'HIGH',
      department: 'Plumbing',
      summary: 'Water leakage and plumbing fixture malfunction requiring immediate attention.',
      reasoning: 'Uncontrolled water pooling poses slip hazard and structural water seepage risk.',
    }
  }
  if (text.includes('electric') || text.includes('light') || text.includes('fan') || text.includes('switch') || text.includes('power') || text.includes('wire') || text.includes('socket')) {
    return {
      category: 'Electrical',
      priority: text.includes('spark') || text.includes('shock') ? 'CRITICAL' : 'MEDIUM',
      department: 'Electrical',
      summary: 'Electrical fixture failure and power supply diagnosis required.',
      reasoning: 'Audible humming or failed luminaire requires certified electrical inspection.',
    }
  }
  if (text.includes('lock') || text.includes('door') || text.includes('window') || text.includes('key') || text.includes('room') || text.includes('bed')) {
    return {
      category: 'Hostel',
      priority: text.includes('lock') || text.includes('door') ? 'HIGH' : 'MEDIUM',
      department: 'Hostel',
      summary: 'Room amenity and security hardware repair.',
      reasoning: 'Securing room entry points is critical for residential student safety.',
    }
  }
  if (text.includes('clean') || text.includes('garbage') || text.includes('trash') || text.includes('waste') || text.includes('dust') || text.includes('sweep') || text.includes('mop') || text.includes('dirty') || text.includes('sanitat')) {
    return {
      category: 'Cleaning',
      priority: 'LOW',
      department: 'Cleaning',
      summary: 'Sanitation and waste clearance request.',
      reasoning: 'Regular sanitation cycle maintains hygiene and campus standards.',
    }
  }
  if (text.includes('bus') || text.includes('transport') || text.includes('route') || text.includes('driver') || text.includes('pickup') || text.includes('drop') || text.includes('vehicle') || text.includes('shuttle') || text.includes('commute')) {
    return {
      category: 'Transport',
      priority: 'HIGH',
      department: 'Transport',
      summary: 'Campus transport routing and vehicle schedule assistance.',
      reasoning: 'Transport punctuality directly impacts student and faculty academic attendance.',
    }
  }
  if (text.includes('fee') || text.includes('certificate') || text.includes('id card') || text.includes('bonafide') || text.includes('document') || text.includes('admission') || text.includes('scholarship') || text.includes('registrar') || text.includes('marksheet') || text.includes('admin')) {
    return {
      category: 'Administration',
      priority: 'MEDIUM',
      department: 'Administration',
      summary: 'Administrative and documentation assistance request.',
      reasoning: 'Processed through central academic and administrative office counters.',
    }
  }
  return {
    category: 'Maintenance',
    priority: 'MEDIUM',
    department: 'Maintenance',
    summary: 'General campus facility maintenance request.',
    reasoning: 'Assigned based on campus facility inspection standards.',
  }
}
