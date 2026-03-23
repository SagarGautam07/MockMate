import { useEffect, useMemo, useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Input } from './ui/input';
import {
  Bot,
  Send,
  ArrowLeft,
  Sparkles,
  CheckCircle,
  Loader2,
  AlertCircle,
  Mic,
  Type,
  Video,
  VideoOff,
} from 'lucide-react';
import { interviewAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from './Toast';
import { useVoice } from '../hooks/useVoice';
import VoiceControls from './VoiceControls';
import CameraPreview from './CameraPreview';
import { toDisplayMessage } from '../utils/errorMessage';

const INTERVIEW_TYPES = [
  { value: 'Technical', label: 'Technical Interview', icon: '💻' },
  { value: 'Behavioral', label: 'Behavioral Interview', icon: '🎯' },
  { value: 'System Design', label: 'System Design', icon: '🏗️' },
  { value: 'HR', label: 'HR Round', icon: '👔' },
];

const DIFFICULTY_LEVELS = [
  { value: 'Beginner', label: 'Beginner' },
  { value: 'Intermediate', label: 'Intermediate' },
  { value: 'Advanced', label: 'Advanced' },
];

export function AIInterview({ onNavigate, onCoinsEarned }) {
  const { user } = useAuth();
  const { toast } = useToast();

  const [stage, setStage] = useState('setup'); // 'setup' | 'interview' | 'feedback'
  const [type, setType] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [role, setRole] = useState('Software Engineer');

  const [sessionId, setSessionId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [answers, setAnswers] = useState([]);

  const [starting, setStarting] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [completing, setCompleting] = useState(false);

  const [errorBanner, setErrorBanner] = useState(null);
  const [lastAction, setLastAction] = useState(null);
  const [finalResult, setFinalResult] = useState(null);

  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [answerMode, setAnswerMode] = useState('text'); // 'text' | 'voice'

  const {
    speak,
    stopSpeaking,
    isSpeaking,
    startListening,
    stopListening,
    isListening,
    transcript,
    resetTranscript,
    sttSupported,
    ttsSupported,
    sttError,
  } = useVoice();

  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  function getUserFriendlyMessage(err) {
    if (err?.code === 'auth/popup-closed-by-user') return null;
    const serverMessage = toDisplayMessage(
      err?.response?.data?.error ??
        err?.response?.data?.message ??
        err?.response?.data?.details,
      '',
    );
    const msg = String(err?.message || '');
    if (serverMessage) return serverMessage;
    if (msg.toLowerCase().includes('network')) return 'Network error. Check your connection.';
    if (msg.toLowerCase().includes('timeout')) {
      return 'The AI interviewer is taking longer than expected. Please retry in a moment.';
    }
    if (err?.response?.status === 401) return 'Session expired. Please sign in again.';
    if (err?.response?.status === 429) return 'Too many requests. Please wait a moment.';
    return 'Something went wrong. Please try again.';
  }

  const retry = useMemo(() => {
    return async () => {
      if (!lastAction) return;
      if (lastAction.type === 'start') return startInterview();
      if (lastAction.type === 'answer') return submitAnswer(lastAction.payload?.answerOverride);
      if (lastAction.type === 'complete') return completeInterview();
    };
  }, [lastAction]);

  async function startInterview() {
    if (!type || !difficulty || !role.trim()) return;

    setLastAction({ type: 'start' });
    setErrorBanner(null);
    setStarting(true);
    setSessionId(null);
    try {
      const data = await interviewAPI.start({ type, difficulty, role });
      if (!data?.sessionId) throw new Error('Server did not return a session ID');
      if (!data?.questions?.length) throw new Error('Server did not return questions');

      setSessionId(data.sessionId);
      console.log('[AIInterview] sessionId:', data.sessionId);
      setQuestions(data.questions || []);
      setAnswers([]);
      setCurrentQuestionIndex(0);
      setUserAnswer('');
      setFinalResult(null);
      setStage('interview');
      toast.success('Interview started. Good luck!');
    } catch (err) {
      console.error('[AIInterview]', err);
      const msg = getUserFriendlyMessage(err);
      if (msg) toast.error(msg);
      setErrorBanner(msg || 'Something went wrong. Please try again.');
    } finally {
      setStarting(false);
    }
  }

  async function submitAnswer(answerOverride = null) {
    const answerToSend = (answerOverride ?? userAnswer).trim();
    if (!answerToSend) {
      toast.error('Please write or speak your answer first');
      return;
    }
    if (!sessionId) {
      toast.error('Session error — please restart the interview');
      return;
    }

    setLastAction({ type: 'answer', payload: { answerOverride: answerToSend } });
    setErrorBanner(null);
    setEvaluating(true);
    try {
      const feedback = await interviewAPI.submitAnswer(sessionId, {
        questionIndex: currentQuestionIndex,
        answer: answerToSend,
        answerMode,
      });

      const nextAnswers = [
        ...answers,
        { question: currentQuestion, answer: answerToSend, feedback },
      ];
      setAnswers(nextAnswers);
      toast.success(`Answer ${currentQuestionIndex + 1} evaluated`);

      if (currentQuestionIndex < questions.length - 1) {
        stopSpeaking();
        stopListening();
        resetTranscript();
        setAnswerMode('text');
        setCurrentQuestionIndex((p) => p + 1);
        setUserAnswer('');
      } else {
        await completeInterview();
      }
    } catch (err) {
      console.error('[AIInterview]', err);
      const msg = getUserFriendlyMessage(err);
      if (msg) toast.error(msg);
      setErrorBanner(msg || 'Something went wrong. Please try again.');
    } finally {
      setEvaluating(false);
    }
  }

  async function completeInterview() {
    if (!sessionId) return;
    setLastAction({ type: 'complete' });
    setErrorBanner(null);
    setCompleting(true);
    try {
      stopSpeaking();
      stopListening();
      resetTranscript();
      setAnswerMode('text');
      setCameraEnabled(false);
      const result = await interviewAPI.complete(sessionId, user);
      setFinalResult(result);
      if (result?.coinsEarned) {
        onCoinsEarned?.(result.coinsEarned);
        toast.success('+5 coins earned!');
      }
      toast.success('Interview completed successfully!');
      setStage('feedback');
    } catch (err) {
      console.error('[AIInterview]', err);
      const msg = getUserFriendlyMessage(err);
      if (msg) toast.error(msg);
      setErrorBanner(msg || 'Something went wrong. Please try again.');
    } finally {
      setCompleting(false);
    }
  }

  const skipQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      stopSpeaking();
      stopListening();
      resetTranscript();
      setAnswerMode('text');
      setCurrentQuestionIndex((prev) => prev + 1);
      setUserAnswer('');
    }
  };

  // Auto-speak the question when it changes (only if TTS is available and we are in interview)
  useEffect(() => {
    if (stage === 'interview' && currentQuestion && ttsSupported) {
      const timer = setTimeout(() => {
        speak(currentQuestion);
      }, 600);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [stage, currentQuestion, ttsSupported, speak]);

  // Keep answer field in sync with voice transcript
  useEffect(() => {
    if (transcript && answerMode === 'voice') {
      setUserAnswer(transcript);
    }
  }, [transcript, answerMode]);

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
            {errorBanner && (
              <div className="mb-6 glass-card neon-border border-red-500/40 bg-red-500/10 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-white/90 text-sm">{errorBanner}</p>
                    <Button
                      onClick={retry}
                      variant="outline"
                      className="mt-3 border-red-400/30 text-white hover:bg-white/10"
                    >
                      Retry
                    </Button>
                  </div>
                </div>
              </div>
            )}

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
                <Select value={type} onValueChange={setType}>
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

              <div>
                <label className="block mb-2">Job Role / Position</label>
                <Input
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. React Developer, Data Engineer"
                  className="bg-white/5 border-cyan-500/30 text-white placeholder:text-white/40 focus:border-cyan-500"
                />
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


              {/* Camera toggle — shown on setup screen */}
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                    <Video className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">Camera Monitor</p>
                    <p className="text-white/50 text-xs">See yourself during the interview</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCameraEnabled(prev => !prev)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    cameraEnabled ? 'bg-cyan-500' : 'bg-white/20'
                  }`}
                >
                  <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow
                    transition-transform ${cameraEnabled ? 'translate-x-5' : 'translate-x-0'}`}
                  />
                </button>
              </div>

              {cameraError && (
                <div className="flex items-center gap-2 text-amber-400 text-xs">
                  <VideoOff className="w-4 h-4 shrink-0" />
                  <span>{cameraError}</span>
                </div>
              )}

              <Button
                onClick={startInterview}
                disabled={!type || !difficulty || !role.trim() || starting}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 cyber-glow border-0 text-white"
                size="lg"
              >
                {starting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
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
          {errorBanner && (
            <div className="mb-6 glass-card neon-border border-red-500/40 bg-red-500/10 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-white/90 text-sm">{errorBanner}</p>
                  <Button
                    onClick={retry}
                    variant="outline"
                    className="mt-3 border-red-400/30 text-white hover:bg-white/10"
                  >
                    Retry
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-cyan-400">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <Badge className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white border-0">{type}</Badge>
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

                {/* Answer mode toggle — Text vs Voice */}
                <div className="flex items-center gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => {
                      setAnswerMode('text');
                      stopListening();
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      answerMode === 'text'
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                        : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                    }`}
                  >
                    <Type className="w-3.5 h-3.5" />
                    Type
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAnswerMode('voice');
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      answerMode === 'voice'
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                        : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                    }`}
                  >
                    <Mic className="w-3.5 h-3.5" />
                    Voice
                    {!sttSupported && (
                      <span className="text-amber-400 text-xs">(Chrome only)</span>
                    )}
                  </button>
                </div>

                {/* Text answer box — shown in text mode */}
                {answerMode === 'text' && (
                  <div className="relative">
                    <Textarea
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      placeholder="Type your answer here..."
                      className="min-h-[200px] bg-white/5 border-cyan-500/30 text-white placeholder:text-white/40 focus:border-cyan-500"
                    />
                  </div>
                )}

                {/* Voice answer — shown in voice mode */}
                {answerMode === 'voice' && (
                  <div className="space-y-3">
                    <VoiceControls
                      isListening={isListening}
                      isSpeaking={isSpeaking}
                      transcript={transcript}
                      sttSupported={sttSupported}
                      ttsSupported={ttsSupported}
                      sttError={sttError}
                      onStartListening={startListening}
                      onStopListening={stopListening}
                      onStopSpeaking={stopSpeaking}
                    />

                    {/* Show transcript as the answer — editable after recording stops */}
                    {transcript && !isListening && (
                      <div className="space-y-2">
                        <p className="text-white/40 text-xs font-mono uppercase tracking-wide">
                          Your answer (edit if needed before submitting)
                        </p>
                        <Textarea
                          value={userAnswer}
                          onChange={(e) => setUserAnswer(e.target.value)}
                          rows={5}
                          className="w-full bg-white/5 border border-cyan-500/30 rounded-xl p-4 text-white resize-none focus:outline-none focus:border-cyan-500/60 transition-colors text-sm leading-relaxed"
                        />
                      </div>
                    )}

                    {/* Prompt to start recording if no transcript yet */}
                    {!transcript && !isListening && (
                      <p className="text-center text-white/30 text-sm py-4">
                        Click the microphone button above to start speaking your answer
                      </p>
                    )}
                  </div>
                )}

                {evaluating && (
                  <p className="mt-3 text-sm text-cyan-300 animate-pulse">
                    🤖 AI is analysing your answer...
                  </p>
                )}

                <p className="text-xs text-white/60 mt-2">
                  💡 Tip: Be specific and explain your thought process
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => submitAnswer()}
                  disabled={!userAnswer.trim() || evaluating || completing}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 cyber-glow border-0 text-white"
                  size="lg"
                >
                  {evaluating || completing ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
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
                  <Badge
                    className={`${
                      (answers[answers.length - 1].feedback?.score ?? 0) >= 80 ? 'bg-green-500' : 'bg-amber-500'
                    } text-white border-0`}
                  >
                    {answers[answers.length - 1].feedback?.score ?? 0}/100
                  </Badge>
                </div>
                <div className="text-sm space-y-2">
                  <div>
                    <span className="text-green-400">✓ Strengths:</span>
                    <ul className="ml-4 mt-1 space-y-1">
                      {(answers[answers.length - 1].feedback?.strengths || []).map((s, i) => (
                        <li key={i} className="text-white/70">• {s}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Camera preview — floating bottom-right, only during interview */}
        <CameraPreview
          active={stage === 'interview' && cameraEnabled}
          onError={(msg) => {
            setCameraError(msg);
            setCameraEnabled(false);
          }}
        />
      </div>
    );
  }

  // Feedback stage - display results and performance summary
  const overallScore = finalResult?.overallScore ?? 0;

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
              <div className="text-4xl mb-1 gradient-text-animate">{overallScore}</div>
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
              <Badge className={`${(item.feedback?.score ?? 0) >= 80 ? 'bg-green-500' : 'bg-amber-500'} text-white border-0`}>
                {item.feedback?.score ?? 0}/100
              </Badge>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-4 text-sm">
              <div>
                <h4 className="text-green-400 mb-2">✓ Strengths</h4>
                <ul className="space-y-1">
                  {(item.feedback?.strengths || []).map((s, i) => (
                    <li key={i} className="text-white/70">• {s}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-amber-400 mb-2">⚠ Areas to Improve</h4>
                <ul className="space-y-1">
                  {(item.feedback?.improvements || []).map((s, i) => (
                    <li key={i} className="text-white/70">• {s}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-4 p-3 glass-card rounded text-sm neon-border-cyan">
              <span className="text-cyan-400">💡 Suggestion: </span>
              <span className="text-white/70">{item.feedback?.suggestion || ''}</span>
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
