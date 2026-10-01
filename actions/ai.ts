'use server'

import { analyzeRequestText, AIRecommendation } from '@/lib/ai/gemini'
import { createClient } from '@/lib/supabase/server'

export async function requestAIAnalysis(params: {
  title: string
  description: string
  location?: string
  currentCategory?: string
  currentPriority?: string
}): Promise<{ success: boolean; data?: AIRecommendation; error?: string }> {
  // Ensure user is authenticated
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Authentication required for AI analysis' }
  }

  if (!params.title || params.title.trim().length < 3) {
    return { success: false, error: 'Please enter a title of at least 3 characters before analyzing with AI' }
  }

  if (!params.description || params.description.trim().length < 5) {
    return { success: false, error: 'Please provide more details in description before analyzing with AI' }
  }

  return await analyzeRequestText(params)
}
