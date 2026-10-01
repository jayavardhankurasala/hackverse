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
      success: false,
      error: 'AI analysis unavailable (GEMINI_API_KEY not configured). You can continue manually.',
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
    console.error('Gemini AI Analysis Error:', err)
    return {
      success: false,
      error: 'AI analysis unavailable at this moment. You can continue manually.',
    }
  }
}
