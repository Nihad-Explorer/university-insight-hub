import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Brain, Sparkles, Send, Loader2, Zap } from 'lucide-react';
import { DashboardFilters, AttendanceBySchool, ProgramAttendance } from '@/types/attendance';
import { cn } from '@/lib/utils';
import { InsightMiniChart } from './InsightMiniChart';

interface AIInsightsPanelProps {
  filters: DashboardFilters;
  schoolData?: AttendanceBySchool[];
  programData?: ProgramAttendance[];
}

const exampleQuestions = [
  "Which school has highest absenteeism?",
  "Compare online vs in-person attendance",
  "Which programs need intervention?",
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
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-insights`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ 
          question: q,
          filters: {
            dateFrom: filters.dateRange.from?.toISOString(),
            dateTo: filters.dateRange.to?.toISOString(),
            schoolId: filters.schoolId,
            programId: filters.programId,
            courseId: filters.courseId,
            status: filters.status,
            deliveryMode: filters.deliveryMode,
          }
        }),
      });

      if (!resp.ok || !resp.body) {
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
      console.error('AI request failed:', error);
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
    lastQuestion.includes('worst') ||
    lastQuestion.includes('best');

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
              <p className="text-xs text-muted-foreground mt-0.5">Executive insights powered by institutional data</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium">
            <Zap className="h-3 w-3" />
            Real-time
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          {exampleQuestions.map((eq, idx) => (
            <Button
              key={idx}
              variant="outline"
              size="sm"
              className="text-xs h-8 px-3 bg-background/50 hover:bg-accent/10 hover:text-accent hover:border-accent/30 transition-all"
              onClick={() => handleAskQuestion(eq)}
              disabled={isLoading}
            >
              <Sparkles className="h-3 w-3 mr-1.5 text-accent" />
              {eq}
            </Button>
          ))}
        </div>

        {/* Custom Question Input */}
        <div className="flex gap-2">
          <Textarea
            placeholder="Ask a strategic question..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="min-h-[50px] resize-none bg-background/50 border-border/50 focus:border-accent/50"
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
            className="px-4 bg-accent hover:bg-accent/90"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
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
