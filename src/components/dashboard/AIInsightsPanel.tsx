import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Brain, Sparkles, Send, Loader2, Zap, TrendingDown, BarChart3, AlertTriangle, Clock, Lightbulb } from 'lucide-react';
import { DashboardFilters, AttendanceBySchool, ProgramAttendance } from '@/types/attendance';
import { cn } from '@/lib/utils';
import { InsightMiniChart } from './InsightMiniChart';
import { logger } from '@/lib/logger';
import { supabase } from '@/integrations/supabase/client';

interface AIInsightsPanelProps {
  filters: DashboardFilters;
  schoolData?: AttendanceBySchool[];
  programData?: ProgramAttendance[];
}

const exampleQuestions = [
  {
    text: "Which school has the highest absentee rate this month?",
    icon: BarChart3,
  },
  {
    text: "Are online sessions better attended than in-person ones?",
    icon: TrendingDown,
  },
  {
    text: "Which programs show declining attendance trends?",
    icon: AlertTriangle,
  },
  {
    text: "What time of day has the most late arrivals?",
    icon: Clock,
  },
  {
    text: "Which courses have the most consistent attendance?",
    icon: Lightbulb,
  },
];

export function AIInsightsPanel({ filters, schoolData, programData }: AIInsightsPanelProps) {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastQuestion, setLastQuestion] = useState('');

  const handleAskQuestion = async (q: string) => {
    if (!q.trim()) return;
    
    setIsLoading(true);
    setResponse('');
    setLastQuestion(q.toLowerCase());
    
    try {
      // Get the current session token for authenticated requests
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setResponse('Please log in to use AI insights.');
        setIsLoading(false);
        return;
      }

      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-insights`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ 
          question: q,
          filters: {
            dateFrom: filters.dateRange.from?.toISOString().split('T')[0],
            dateTo: filters.dateRange.to?.toISOString().split('T')[0],
            schoolId: filters.schoolId,
            programId: filters.programId,
            courseId: filters.courseId,
            status: filters.status,
            deliveryMode: filters.deliveryMode,
          }
        }),
      });

      if (!resp.ok || !resp.body) {
        if (resp.status === 401) {
          setResponse('Session expired. Please log in again.');
          return;
        }
        if (resp.status === 429) {
          setResponse('Rate limit exceeded. Please try again in a moment.');
          return;
        }
        if (resp.status === 402) {
          setResponse('AI credits exhausted. Please add more credits to continue.');
          return;
        }
        throw new Error('Failed to get AI response');
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        textBuffer += decoder.decode(value, { stream: true });
        
        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              fullResponse += content;
              setResponse(fullResponse);
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }
    } catch (error) {
      logger.error('AI request failed:', error);
      setResponse('Unable to analyze data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = () => {
    handleAskQuestion(question);
    setQuestion('');
  };

  // Determine which chart to show based on question keywords
  const shouldShowSchoolChart = lastQuestion.includes('school') || 
    lastQuestion.includes('absentee') || 
    lastQuestion.includes('highest') ||
    lastQuestion.includes('lowest');
    
  const shouldShowProgramChart = lastQuestion.includes('program') || 
    lastQuestion.includes('intervention') ||
    lastQuestion.includes('declining') ||
    lastQuestion.includes('trend') ||
    lastQuestion.includes('worst') ||
    lastQuestion.includes('best');

  // Format active filters for display
  const activeFiltersText = [
    filters.dateRange.from && `From: ${filters.dateRange.from.toLocaleDateString()}`,
    filters.dateRange.to && `To: ${filters.dateRange.to.toLocaleDateString()}`,
    filters.schoolId && 'School filter active',
    filters.programId && 'Program filter active',
    filters.courseId && 'Course filter active',
    filters.status && `Status: ${filters.status}`,
    filters.deliveryMode && `Mode: ${filters.deliveryMode}`,
  ].filter(Boolean);

  return (
    <Card className="border-border/50 bg-gradient-to-br from-card to-accent/5 shadow-card animate-slide-up">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-accent to-accent/80 p-2.5 shadow-sm">
              <Brain className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold tracking-tight">AI Intelligence</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Ask questions in plain English • Powered by Lovable AI
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium">
            <Zap className="h-3 w-3" />
            Real-time
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Active Filters Display */}
        {activeFiltersText.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <span className="text-xs text-muted-foreground">Active filters:</span>
            {activeFiltersText.map((filter, idx) => (
              <span
                key={idx}
                className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
              >
                {filter}
              </span>
            ))}
          </div>
        )}

        {/* AI Capabilities Description */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <TrendingDown className="h-3.5 w-3.5 text-accent" />
            <span>Identify trends</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <BarChart3 className="h-3.5 w-3.5 text-accent" />
            <span>Compare data</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <AlertTriangle className="h-3.5 w-3.5 text-accent" />
            <span>Highlight anomalies</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Lightbulb className="h-3.5 w-3.5 text-accent" />
            <span>Suggest improvements</span>
          </div>
        </div>

        {/* Example Questions - 5 pre-defined */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Example Questions
          </p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {exampleQuestions.map((eq, idx) => {
              const Icon = eq.icon;
              return (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  className="text-xs h-auto py-2 px-3 bg-background/50 hover:bg-accent/10 hover:text-accent hover:border-accent/30 transition-all text-left justify-start whitespace-normal"
                  onClick={() => handleAskQuestion(eq.text)}
                  disabled={isLoading}
                >
                  <Icon className="h-3.5 w-3.5 mr-2 shrink-0 text-accent" />
                  <span className="line-clamp-2">{eq.text}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Custom Question Input */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Ask Your Own Question
          </p>
          <div className="flex gap-2">
            <Textarea
              placeholder="Type your question in plain English... e.g., 'Why is attendance dropping on Fridays?'"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="min-h-[60px] resize-none bg-background/50 border-border/50 focus:border-accent/50"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
            <Button 
              onClick={handleSubmit} 
              disabled={isLoading || !question.trim()}
              className="px-4 bg-accent hover:bg-accent/90 self-end"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Response Area */}
        {(response || isLoading) && (
          <div className="space-y-4">
            <div className={cn(
              "rounded-xl border border-accent/20 bg-gradient-to-br from-background to-accent/5 p-4"
            )}>
              {isLoading && !response && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin text-accent" />
                  <span className="text-sm">Analyzing institutional data...</span>
                </div>
              )}
              {response && (
                <div className="text-sm leading-relaxed text-foreground font-medium whitespace-pre-wrap">
                  {response}
                </div>
              )}
            </div>

            {/* Insight-Driven Visuals */}
            {response && !isLoading && (shouldShowSchoolChart || shouldShowProgramChart) && (
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Supporting Visualization
                </p>
                <InsightMiniChart 
                  type={shouldShowSchoolChart ? 'school' : 'program'}
                  schoolData={schoolData}
                  programData={programData}
                />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
