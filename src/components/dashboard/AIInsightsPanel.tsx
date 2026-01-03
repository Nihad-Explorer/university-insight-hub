import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Brain, Sparkles, Send, Loader2 } from 'lucide-react';
import { DashboardFilters } from '@/types/attendance';
import { cn } from '@/lib/utils';

interface AIInsightsPanelProps {
  filters: DashboardFilters;
}

const exampleQuestions = [
  "Which school has the highest absentee rate this month?",
  "Are online sessions better attended than in-person ones?",
  "Which programs show declining attendance trends?",
  "What time of day has the most late arrivals?",
  "Which courses have the most consistent attendance?"
];

export function AIInsightsPanel({ filters }: AIInsightsPanelProps) {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAskQuestion = async (q: string) => {
    if (!q.trim()) return;
    
    setIsLoading(true);
    setResponse('');
    
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
      setResponse('Sorry, I encountered an error analyzing the data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = () => {
    handleAskQuestion(question);
    setQuestion('');
  };

  return (
    <Card className="border-border bg-card animate-slide-up">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-accent/20 p-2">
            <Brain className="h-5 w-5 text-accent" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold">AI Insights</CardTitle>
            <p className="text-sm text-muted-foreground">Ask questions about your attendance data</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Example Questions */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {exampleQuestions.map((eq, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                className="text-xs h-auto py-1.5 px-3"
                onClick={() => handleAskQuestion(eq)}
                disabled={isLoading}
              >
                <Sparkles className="h-3 w-3 mr-1.5" />
                {eq}
              </Button>
            ))}
          </div>
        </div>

        {/* Custom Question Input */}
        <div className="flex gap-2">
          <Textarea
            placeholder="Ask a question about your attendance data..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="min-h-[60px] resize-none"
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
            className="px-4"
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
          <div className={cn(
            "rounded-lg border border-border bg-muted/30 p-4",
            "prose prose-sm max-w-none dark:prose-invert"
          )}>
            {isLoading && !response && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Analyzing attendance data...</span>
              </div>
            )}
            {response && (
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {response}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
