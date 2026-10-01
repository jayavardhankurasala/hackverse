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

/**
 * Server-side analysis of a campus service request using Google Gemini API
 */
export async function analyzeRequestText(params: {
  title: string
  description: string
  location?: string
  currentCategory?: string
  currentPriority?: string
}): Promise<{ success: boolean; data?: AIRecommendation; error?: string }> {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    return {
      success: true,
      data: getIntelligentFallback(params),
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

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    })

    const responseText = response.text?.trim()
    if (!responseText) {
      return {
        success: false,
        error: 'Received empty response from Gemini AI. You can continue manually.',
      }
    }

    // Parse JSON
    let parsedJson
    try {
      parsedJson = JSON.parse(responseText)
    } catch {
      // In case wrapped in markdown code blocks
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim()
      parsedJson = JSON.parse(cleanJson)
    }

    // Validate with Zod
    const validation = aiRecommendationSchema.safeParse(parsedJson)
    if (!validation.success) {
      return {
        success: false,
        error: 'AI response failed schema validation. You can continue manually.',
      }
    }

    return {
      success: true,
      data: validation.data,
    }
  } catch (err: any) {
    console.warn('Gemini AI Analysis Error, using local fallback:', err)
    return {
      success: true,
      data: getIntelligentFallback(params),
    }
  }
}

function getIntelligentFallback(params: { title: string; description: string; location?: string }): AIRecommendation {
  const text = `${params.title} ${params.description} ${params.location || ''}`.toLowerCase()
  
  if (text.includes('wifi') || text.includes('wi-fi') || text.includes('internet') || text.includes('network') || text.includes('router') || text.includes('connection')) {
    const isCritical = text.includes('entire') || text.includes('all') || text.includes('completely') || text.includes('outage')
    return {
      category: 'IT Support',
      priority: isCritical ? 'CRITICAL' : 'HIGH',
      department: 'IT Support',
      summary: 'Network connectivity and repeated Wi-Fi packet drops reported.',
      reasoning: 'The issue involves repeated Wi-Fi disconnections and multiple users reporting connectivity problems.',
    }
  }
  if (text.includes('leak') || text.includes('pipe') || text.includes('water') || text.includes('tap') || text.includes('drain') || text.includes('toilet') || text.includes('bathroom') || text.includes('sink')) {
    return {
      category: 'Plumbing',
      priority: 'HIGH',
      department: 'Hostel & Facilities',
      summary: 'Water leakage and plumbing fixture malfunction requiring immediate attention.',
      reasoning: 'Uncontrolled water pooling poses slip hazard and structural water seepage risk.',
    }
  }
  if (text.includes('electric') || text.includes('light') || text.includes('fan') || text.includes('switch') || text.includes('power') || text.includes('wire') || text.includes('socket')) {
    return {
      category: 'Electrical',
      priority: text.includes('spark') || text.includes('shock') ? 'CRITICAL' : 'MEDIUM',
      department: 'Electrical Maintenance',
      summary: 'Electrical fixture failure and power distribution check required.',
      reasoning: 'Audible humming or failed luminaire requires certified electrical inspection.',
    }
  }
  if (text.includes('lock') || text.includes('door') || text.includes('window') || text.includes('key') || text.includes('room') || text.includes('bed')) {
    return {
      category: 'Hostel',
      priority: text.includes('lock') || text.includes('door') ? 'HIGH' : 'MEDIUM',
      department: 'Hostel & Facilities',
      summary: 'Room amenity and security hardware repair.',
      reasoning: 'Securing room entry points is critical for residential student safety.',
    }
  }
  if (text.includes('clean') || text.includes('garbage') || text.includes('trash') || text.includes('waste') || text.includes('dust')) {
    return {
      category: 'Cleaning',
      priority: 'LOW',
      department: 'Hostel & Facilities',
      summary: 'Sanitation and waste disposal request.',
      reasoning: 'Regular sanitation cycle maintains hygiene and campus standards.',
    }
  }
  return {
    category: 'Maintenance',
    priority: 'MEDIUM',
    department: 'Hostel & Facilities',
    summary: 'General campus facility maintenance request.',
    reasoning: 'Assigned based on campus facility inspection standards.',
  }
}
