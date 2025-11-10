// AI Interview component - handles text-based interview practice sessions
// Manages interview setup, question flow, answer submission, and feedback generation

import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Bot, Send, ArrowLeft, Sparkles, CheckCircle } from 'lucide-react';

// Available interview types for users to choose from
const INTERVIEW_TYPES = [
  { value: 'technical', label: 'Technical Interview', icon: '💻' },
  { value: 'behavioral', label: 'Behavioral Interview', icon: '🎯' },
  { value: 'system-design', label: 'System Design', icon: '🏗️' },
  { value: 'hr', label: 'HR Round', icon: '👔' },
];

// Difficulty levels for interview customization
const DIFFICULTY_LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

// Sample questions organized by interview type
const SAMPLE_QUESTIONS = {
  technical: [
    "Can you explain the difference between synchronous and asynchronous programming?",
    "How would you optimize a slow database query?",
    "What are the main differences between REST and GraphQL?",
  ],
  behavioral: [
    "Tell me about a time when you had to work with a difficult team member.",
    "Describe a situation where you had to meet a tight deadline.",
    "How do you handle constructive criticism?",
  ],
  'system-design': [
    "How would you design a URL shortening service like bit.ly?",
    "Design a rate limiter for an API.",
    "How would you architect a notification system?",
  ],
  hr: [
    "Why do you want to work for our company?",
    "Where do you see yourself in 5 years?",
    "What are your salary expectations?",
  ],
};

export function AIInterview({ onNavigate, onComplete, onCoinsEarned }) {
  // Interview session state management
  const [stage, setStage] = useState('setup'); // 'setup', 'interview', or 'feedback'
  const [interviewType, setInterviewType] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [answers, setAnswers] = useState([]);

  // Get questions based on selected interview type
  const questions = interviewType ? SAMPLE_QUESTIONS[interviewType] : [];
  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  // Start the interview session after configuration
  const startInterview = () => {
    if (interviewType && difficulty) {
      setStage('interview');
    }
  };

  // Generate AI-powered feedback for user answers
  // In a real implementation, this would call an AI API
  const generateAIFeedback = (question, answer) => {
    const score = Math.floor(Math.random() * 30) + 70;
    return {
      score,
      strengths: [
        'Clear communication',
        'Good structure in your response',
        'Relevant examples provided',
      ],
      improvements: [
        'Could add more specific metrics',
        'Consider mentioning edge cases',
        'Add more technical depth',
      ],
      suggestions: 'Try to use the STAR method (Situation, Task, Action, Result) for more structured responses.',
    };
  };

  // Handle answer submission and move to next question or finish interview
  const submitAnswer = () => {
    if (!userAnswer.trim()) return;

    const feedback = generateAIFeedback(currentQuestion, userAnswer);
    const newAnswers = [...answers, { question: currentQuestion, answer: userAnswer, feedback }];
    setAnswers(newAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      // Move to next question
      setCurrentQuestionIndex((prev) => prev + 1);
      setUserAnswer('');
    } else {
      // Interview complete - calculate average score and save to history
      const avgScore = newAnswers.reduce((acc, curr) => acc + curr.feedback.score, 0) / newAnswers.length;
      onComplete({
        type: 'AI Interview',
        interviewType,
        difficulty,
        date: new Date().toISOString(),
        score: avgScore,
        questionsCount: questions.length,
      });
      onCoinsEarned(5); // Award coins for completing interview
      setStage('feedback');
    }
  };

  // Skip current question and move to next
  const skipQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setUserAnswer('');
    }
  };

  // Setup stage - user selects interview type and difficulty
  if (stage === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 py-12 px-4 particle-bg relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30"></div>

        <div className="max-w-2xl mx-auto relative z-10">
          <Button
            variant="ghost"
            onClick={() => onNavigate('home')}
            className="mb-6 text-white hover:text-cyan-400 hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>

          <Card className="p-8 glass-card neon-border cyber-glow scan-line">
            <div className="flex flex-col items-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 blur-2xl opacity-60 animate-pulse-slow"></div>

                <div className="relative w-24 h-24 bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 rounded-full flex items-center justify-center cyber-glow-intense">
                  <div className="absolute inset-2 bg-gradient-to-br from-slate-900 to-slate-800 rounded-full flex items-center justify-center">
                    <Bot className="w-12 h-12 text-cyan-400" />
                  </div>

                  <div className="absolute inset-0 rounded-full overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/30 to-transparent animate-scan"></div>
                  </div>
                </div>
              </div>

              <div className="mt-4 text-center">
                <h2 className="text-white mb-1">Meet Your AI Interviewer</h2>
                <p className="text-sm text-cyan-400">Configure your practice session below</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block mb-2">Interview Type</label>
                <Select value={interviewType} onValueChange={setInterviewType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select interview type" />
                  </SelectTrigger>
                  <SelectContent>
                    {INTERVIEW_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <span className="mr-2">{type.icon}</span>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block mb-2">Difficulty Level</label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    {DIFFICULTY_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="glass-card p-4 rounded-lg neon-border-cyan">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-cyan-400 mt-0.5 animate-pulse-slow" />
                  <div>
                    <h4 className="mb-1 text-white">What to Expect</h4>
                    <ul className="text-sm text-white/70 space-y-1">
                      <li>• 💬 Text-based Q&A interview format</li>
                      <li>• ✍️ Type your answers in the text area</li>
                      <li>• 📝 Get instant AI-powered feedback after each response</li>
                      <li>• 📊 Review your detailed performance at the end</li>
                    </ul>
                  </div>
                </div>
              </div>


              <Button
                onClick={startInterview}
                disabled={!interviewType || !difficulty}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 cyber-glow border-0 text-white"
                size="lg"
              >
                Start Interview
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Interview stage - user answers questions
  if (stage === 'interview') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 py-12 px-4 particle-bg relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30"></div>

        <div className="max-w-3xl mx-auto relative z-10">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-cyan-400">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <Badge className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white border-0">{interviewType}</Badge>
            </div>
            <Progress value={progress} className="h-2 bg-white/10" />
          </div>

          <Card className="p-8 mb-6 glass-card neon-border scan-line">
            <div className="flex flex-col items-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 blur-2xl opacity-60 animate-pulse-slow"></div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 blur-xl opacity-40 animate-pulse-slow" style={{ animationDelay: '1s' }}></div>

                <div className="relative w-32 h-32 bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 rounded-full flex items-center justify-center cyber-glow-intense animate-float">
                  <div className="absolute inset-2 bg-gradient-to-br from-slate-900 to-slate-800 rounded-full flex items-center justify-center">
                    <Bot className="w-16 h-16 text-cyan-400" />
                  </div>

                  <div className="absolute inset-0 rounded-full overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/30 to-transparent animate-scan"></div>
                  </div>
                </div>
              </div>

              <div className="mt-4 text-center">
                <h3 className="text-white mb-1">AI Interviewer</h3>
                <p className="text-sm text-white/60 mt-2">Ready to interview</p>
              </div>
            </div>

            <div className="flex items-start gap-4 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 cyber-glow animate-pulse-slow">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="glass-card p-4 rounded-lg neon-border-cyan relative">
                  <div className="absolute -left-2 top-4 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-cyan-500/50"></div>
                  <p className="text-white">{currentQuestion}</p>
                </div>
              </div>

            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-cyan-400">Your Answer</label>
                </div>

                <div className="relative">
                  <Textarea
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Type your answer here..."
                    className="min-h-[200px] bg-white/5 border-cyan-500/30 text-white placeholder:text-white/40 focus:border-cyan-500"
                  />
                </div>

                <p className="text-xs text-white/60 mt-2">
                  💡 Tip: Type your answer. Be specific and explain your thought process
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={submitAnswer}
                  disabled={!userAnswer.trim()}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 cyber-glow border-0 text-white"
                  size="lg"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Submit Answer
                </Button>
                <Button
                  onClick={skipQuestion}
                  variant="outline"
                  disabled={currentQuestionIndex === questions.length - 1}
                  className="border-cyan-500/30 text-white hover:bg-white/10"
                >
                  Skip
                </Button>
              </div>
            </div>
          </Card>

          {/* Display feedback for the most recent answer */}
          {answers.length > 0 && (
            <Card className="p-6 glass-card neon-border">
              <h4 className="mb-4 text-white">Recent Feedback</h4>
              <div className="glass-card p-4 rounded-lg neon-border-cyan">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-cyan-400">Score</span>
                  <Badge className={`${answers[answers.length - 1].feedback.score >= 80 ? 'bg-green-500' : 'bg-amber-500'} text-white border-0`}>
                    {answers[answers.length - 1].feedback.score}/100
                  </Badge>
                </div>
                <div className="text-sm space-y-2">
                  <div>
                    <span className="text-green-400">✓ Strengths:</span>
                    <ul className="ml-4 mt-1 space-y-1">
                      {answers[answers.length - 1].feedback.strengths.map((s, i) => (
                        <li key={i} className="text-white/70">• {s}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    );
  }

  // Feedback stage - display results and performance summary
  const avgScore = answers.length ? (answers.reduce((acc, curr) => acc + curr.feedback.score, 0) / answers.length) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 py-12 px-4 particle-bg relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-30"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        <Card className="p-8 mb-6 text-center glass-card neon-border cyber-glow-intense">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4 animate-float" />
          <h2 className="mb-2 text-white">Interview Complete! 🎉</h2>
          <p className="text-cyan-400 mb-6">
            Great job! Here's your detailed performance report.
          </p>

          <div className="inline-flex items-center gap-4 glass-card px-8 py-4 rounded-lg mb-4 neon-border-cyan">
            <div>
              <div className="text-4xl mb-1 gradient-text-animate">{avgScore.toFixed(0)}</div>
              <div className="text-sm text-white/70">Overall Score</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 px-6 py-3 rounded-lg inline-flex items-center gap-2 neon-border cyber-glow">
            <span className="text-2xl animate-float">🪙</span>
            <span className="text-sm text-white/70">You earned</span>
            <span className="text-xl text-white font-semibold">+5 Coins</span>
          </div>
        </Card>

        {/* Display detailed feedback for each question */}
        {answers.map((item, index) => (
          <Card key={index} className="p-6 mb-4 glass-card neon-border hover:cyber-glow transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <Badge className="mb-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white border-0">Question {index + 1}</Badge>
                <p className="mb-3 text-white">{item.question}</p>
                <div className="glass-card p-3 rounded text-sm text-white/70 neon-border-cyan">
                  {item.answer}
                </div>
              </div>
              <Badge className={`${item.feedback.score >= 80 ? 'bg-green-500' : 'bg-amber-500'} text-white border-0`}>
                {item.feedback.score}/100
              </Badge>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-4 text-sm">
              <div>
                <h4 className="text-green-400 mb-2">✓ Strengths</h4>
                <ul className="space-y-1">
                  {item.feedback.strengths.map((s, i) => (
                    <li key={i} className="text-white/70">• {s}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-amber-400 mb-2">⚠ Areas to Improve</h4>
                <ul className="space-y-1">
                  {item.feedback.improvements.map((s, i) => (
                    <li key={i} className="text-white/70">• {s}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-4 p-3 glass-card rounded text-sm neon-border-cyan">
              <span className="text-cyan-400">💡 Suggestion: </span>
              <span className="text-white/70">{item.feedback.suggestions}</span>
            </div>
          </Card>
        ))}

        <div className="flex gap-3">
          <Button 
            onClick={() => window.location.reload()} 
            className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 cyber-glow border-0 text-white"
          >
            Practice Again
          </Button>
          <Button 
            variant="outline" 
            onClick={() => onNavigate('dashboard')} 
            className="flex-1 border-cyan-500/30 text-white hover:bg-white/10"
          >
            View Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}

