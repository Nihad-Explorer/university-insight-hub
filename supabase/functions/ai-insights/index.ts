import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question, filters } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are an expert university attendance data analyst. You help analyze attendance patterns and provide actionable insights based on attendance data from a university system.

The data includes:
- Schools (faculties/departments)
- Programs (degree programs within schools)
- Courses (individual courses within programs)
- Class Sessions (individual class meetings with date, time, delivery mode: online or in-person)
- Students (with school, program, level, entry year, nationality, gender)
- Attendance Records (status: present, late, excused, absent; with minutes late for late arrivals)

Current filters applied:
${filters.dateFrom ? `- Date from: ${filters.dateFrom}` : '- Date from: Not specified'}
${filters.dateTo ? `- Date to: ${filters.dateTo}` : '- Date to: Not specified'}
${filters.schoolId ? `- School ID: ${filters.schoolId}` : '- School: All schools'}
${filters.programId ? `- Program ID: ${filters.programId}` : '- Program: All programs'}
${filters.courseId ? `- Course ID: ${filters.courseId}` : '- Course: All courses'}
${filters.status ? `- Status: ${filters.status}` : '- Status: All statuses'}
${filters.deliveryMode ? `- Delivery Mode: ${filters.deliveryMode}` : '- Delivery Mode: All modes'}

Guidelines:
1. Provide specific, data-driven insights when possible
2. Identify trends, patterns, and anomalies
3. Compare metrics across different dimensions (schools, programs, delivery modes, time periods)
4. Suggest actionable recommendations for improving attendance
5. Be concise but thorough
6. Use bullet points and clear formatting
7. If you don't have specific data, provide general insights based on common attendance patterns and best practices
8. Mention that specific numbers would require analyzing the actual filtered data`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question }
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add more credits.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });
  } catch (error) {
    console.error('AI insights error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
