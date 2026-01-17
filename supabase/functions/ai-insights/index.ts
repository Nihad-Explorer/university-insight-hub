import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validation types
interface AIFilters {
  dateFrom?: string;
  dateTo?: string;
  schoolId?: string;
  programId?: string;
  courseId?: string;
  status?: string;
  deliveryMode?: string;
}

interface AIRequest {
  question: string;
  filters: AIFilters;
}

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Date format validation (YYYY-MM-DD)
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// Valid enum values
const VALID_STATUS = ['present', 'late', 'excused', 'absent'];
const VALID_DELIVERY_MODE = ['online', 'in-person'];

// Input validation function
function validateRequest(data: unknown): AIRequest {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid request body');
  }

  const body = data as Record<string, unknown>;

  // Validate question
  if (!body.question || typeof body.question !== 'string') {
    throw new Error('Question is required and must be a string');
  }

  const question = body.question.trim();
  
  if (question.length < 1) {
    throw new Error('Question cannot be empty');
  }
  
  if (question.length > 500) {
    throw new Error('Question too long (max 500 characters)');
  }

  // Sanitize question - remove control characters
  const sanitizedQuestion = question.replace(/[\x00-\x1F\x7F]/g, '');

  // Validate filters
  const filters: AIFilters = {};
  const rawFilters = (body.filters || {}) as Record<string, unknown>;

  // Validate dateFrom
  if (rawFilters.dateFrom !== undefined && rawFilters.dateFrom !== null) {
    if (typeof rawFilters.dateFrom !== 'string') {
      throw new Error('dateFrom must be a string');
    }
    if (rawFilters.dateFrom && !DATE_REGEX.test(rawFilters.dateFrom)) {
      throw new Error('dateFrom must be in YYYY-MM-DD format');
    }
    filters.dateFrom = rawFilters.dateFrom;
  }

  // Validate dateTo
  if (rawFilters.dateTo !== undefined && rawFilters.dateTo !== null) {
    if (typeof rawFilters.dateTo !== 'string') {
      throw new Error('dateTo must be a string');
    }
    if (rawFilters.dateTo && !DATE_REGEX.test(rawFilters.dateTo)) {
      throw new Error('dateTo must be in YYYY-MM-DD format');
    }
    filters.dateTo = rawFilters.dateTo;
  }

  // Validate schoolId (UUID)
  if (rawFilters.schoolId !== undefined && rawFilters.schoolId !== null) {
    if (typeof rawFilters.schoolId !== 'string') {
      throw new Error('schoolId must be a string');
    }
    if (rawFilters.schoolId && !UUID_REGEX.test(rawFilters.schoolId)) {
      throw new Error('Invalid schoolId format (must be UUID)');
    }
    filters.schoolId = rawFilters.schoolId;
  }

  // Validate programId (UUID)
  if (rawFilters.programId !== undefined && rawFilters.programId !== null) {
    if (typeof rawFilters.programId !== 'string') {
      throw new Error('programId must be a string');
    }
    if (rawFilters.programId && !UUID_REGEX.test(rawFilters.programId)) {
      throw new Error('Invalid programId format (must be UUID)');
    }
    filters.programId = rawFilters.programId;
  }

  // Validate courseId (UUID)
  if (rawFilters.courseId !== undefined && rawFilters.courseId !== null) {
    if (typeof rawFilters.courseId !== 'string') {
      throw new Error('courseId must be a string');
    }
    if (rawFilters.courseId && !UUID_REGEX.test(rawFilters.courseId)) {
      throw new Error('Invalid courseId format (must be UUID)');
    }
    filters.courseId = rawFilters.courseId;
  }

  // Validate status (enum)
  if (rawFilters.status !== undefined && rawFilters.status !== null) {
    if (typeof rawFilters.status !== 'string') {
      throw new Error('status must be a string');
    }
    if (rawFilters.status && !VALID_STATUS.includes(rawFilters.status)) {
      throw new Error(`Invalid status value. Must be one of: ${VALID_STATUS.join(', ')}`);
    }
    filters.status = rawFilters.status;
  }

  // Validate deliveryMode (enum)
  if (rawFilters.deliveryMode !== undefined && rawFilters.deliveryMode !== null) {
    if (typeof rawFilters.deliveryMode !== 'string') {
      throw new Error('deliveryMode must be a string');
    }
    if (rawFilters.deliveryMode && !VALID_DELIVERY_MODE.includes(rawFilters.deliveryMode)) {
      throw new Error(`Invalid deliveryMode value. Must be one of: ${VALID_DELIVERY_MODE.join(', ')}`);
    }
    filters.deliveryMode = rawFilters.deliveryMode;
  }

  return { question: sanitizedQuestion, filters };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse and validate request
    let rawData: unknown;
    try {
      rawData = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON in request body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate input
    let validated: AIRequest;
    try {
      validated = validateRequest(rawData);
    } catch (validationError) {
      return new Response(JSON.stringify({ 
        error: validationError instanceof Error ? validationError.message : 'Validation failed' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { question, filters } = validated;
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are a university attendance analytics copilot.

RESPONSE RULES (must follow):
- Max 3 bullet points
- Max 2 short sentences per bullet
- No methodology explanations
- No assumptions unless explicitly asked
- No repeating filters back to the user
- Use plain English, executive tone

VISUALIZATION TRIGGER RULE:
If the user asks "Which", "Compare", "Trend", "Worst", "Best", "Highest", "Lowest":
- Always recommend a chart type (bar or line)
- Do not ask follow-up questions
- Do not explain calculations

ATTENDANCE RATE CALCULATION:
present / (present + absent)
Ignore late and excused in the denominator unless explicitly selected.

INSIGHT CARD FORMAT (preferred):
**Bold headline**
One supporting metric
One implication

Example:
**Law has highest absenteeism**
18% vs 12% university average
Focus intervention here first

DATA CONTEXT:
- Schools, Programs, Courses, Class Sessions, Students, Attendance Records
- Status values: present, late, excused, absent
- Delivery modes: online, in-person

Current filters: ${JSON.stringify(filters)}

If data is insufficient, respond only: "Not enough data with current filters."`;

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
    return new Response(JSON.stringify({ error: 'An error occurred processing your request' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
