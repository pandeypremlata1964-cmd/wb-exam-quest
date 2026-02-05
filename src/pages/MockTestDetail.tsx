import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Clock, X } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface MockTest {
  id: string;
  title: string;
  subject: string;
  chapter: string | null;
  duration: number;
  difficulty: string;
}

interface Question {
  id: string;
  question_text: string;
  options: string[];
  correct_answer: number;
  explanation: string | null;
  order_index: number;
}

export default function MockTestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [test, setTest] = useState<MockTest | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchTestData();
  }, [id]);

  useEffect(() => {
    if (started && !submitted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            submitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [started, submitted, timeLeft]);

  const fetchTestData = async () => {
    setIsLoading(true);

    // Fetch test
    const { data: testData } = await supabase
      .from('mock_tests')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (testData) {
      setTest(testData as MockTest);
    }

    // Fetch questions
    const { data: questionsData } = await supabase
      .from('questions')
      .select('*')
      .eq('mock_test_id', id)
      .order('order_index');

    if (questionsData) {
      // Parse options from JSON if needed
      const parsedQuestions = questionsData.map((q) => ({
        ...q,
        options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
      }));
      setQuestions(parsedQuestions as Question[]);
    }

    setIsLoading(false);
  };

  const startTest = () => {
    setStarted(true);
    setTimeLeft((test?.duration || 10) * 60);
    setAnswers(new Array(questions.length).fill(null));
  };

  const selectAnswer = (optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = optionIndex;
    setAnswers(newAnswers);
  };

  const submitTest = async () => {
    setSubmitted(true);

    // Calculate score
    let correct = 0;
    answers.forEach((answer, index) => {
      if (answer === questions[index]?.correct_answer) {
        correct++;
      }
    });

    // Save attempt if logged in
    if (user && test) {
      await supabase.from('test_attempts').insert({
        user_id: user.id,
        mock_test_id: test.id,
        answers: answers,
        score: correct,
        total_questions: questions.length,
        time_taken: (test.duration * 60) - timeLeft,
      });
    }
  };

  const retakeTest = () => {
    setStarted(false);
    setSubmitted(false);
    setCurrentQuestion(0);
    setAnswers([]);
    setTimeLeft(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateScore = () => {
    let correct = 0;
    answers.forEach((answer, index) => {
      if (answer === questions[index]?.correct_answer) {
        correct++;
      }
    });
    return {
      correct,
      wrong: questions.length - correct,
      total: questions.length,
      percentage: questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0,
    };
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </Layout>
    );
  }

  if (!test) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 text-center">
          <p>Test not found</p>
          <Button onClick={() => navigate('/mock-tests')} className="mt-4">
            Back to Mock Tests
          </Button>
        </div>
      </Layout>
    );
  }

  // Results Screen
  if (submitted) {
    const score = calculateScore();
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-2xl p-8 text-center"
          >
            <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 ${
              score.percentage >= 70 ? 'bg-success/20' : score.percentage >= 40 ? 'bg-warning/20' : 'bg-destructive/20'
            }`}>
              <span className={`text-3xl font-bold ${
                score.percentage >= 70 ? 'text-success' : score.percentage >= 40 ? 'text-warning' : 'text-destructive'
              }`}>
                {score.percentage}%
              </span>
            </div>

            <h2 className="text-2xl font-bold mb-2">Test Completed!</h2>
            <p className="text-muted-foreground mb-6">{test.title}</p>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="glass rounded-xl p-4">
                <div className="text-2xl font-bold text-success">{score.correct}</div>
                <div className="text-sm text-muted-foreground">Correct</div>
              </div>
              <div className="glass rounded-xl p-4">
                <div className="text-2xl font-bold text-destructive">{score.wrong}</div>
                <div className="text-sm text-muted-foreground">Wrong</div>
              </div>
              <div className="glass rounded-xl p-4">
                <div className="text-2xl font-bold">{score.total}</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={retakeTest} className="gradient-primary border-0">
                Retake Test
              </Button>
              <Button variant="outline" onClick={() => navigate('/mock-tests')}>
                Back to Tests
              </Button>
            </div>
          </motion.div>

          {/* Answer Review */}
          <div className="mt-8 space-y-4">
            <h3 className="text-xl font-semibold">Answer Review</h3>
            {questions.map((q, index) => (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass rounded-xl p-4"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                    answers[index] === q.correct_answer ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'
                  }`}>
                    {answers[index] === q.correct_answer ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{q.question_text}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your answer: {answers[index] !== null ? q.options[answers[index]] : 'Not answered'}
                    </p>
                    {answers[index] !== q.correct_answer && (
                      <p className="text-sm text-success mt-1">
                        Correct: {q.options[q.correct_answer]}
                      </p>
                    )}
                    {q.explanation && (
                      <p className="text-sm text-muted-foreground mt-2 italic">
                        {q.explanation}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  // Start Screen
  if (!started) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Button variant="ghost" onClick={() => navigate('/mock-tests')} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-8"
          >
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{test.title}</h1>
            <p className="text-muted-foreground">
              {test.subject} {test.chapter && `• ${test.chapter}`}
            </p>

            <div className="grid grid-cols-2 gap-4 my-8">
              <div className="glass rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-primary">{questions.length}</div>
                <div className="text-sm text-muted-foreground">Questions</div>
              </div>
              <div className="glass rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-primary">{test.duration}</div>
                <div className="text-sm text-muted-foreground">Minutes</div>
              </div>
            </div>

            <div className="space-y-3 mb-8 text-sm text-muted-foreground">
              <p>• Each question carries equal marks</p>
              <p>• No negative marking</p>
              <p>• Timer will start once you begin</p>
              <p>• You can review answers after submission</p>
              {user && <p className="text-primary">• Your progress will be saved automatically</p>}
              {!user && <p className="text-warning">• Sign in to save your progress</p>}
            </div>

            <Button onClick={startTest} size="lg" className="w-full gradient-primary border-0">
              Start Test
            </Button>
          </motion.div>
        </div>
      </Layout>
    );
  }

  // Test Screen
  const question = questions[currentQuestion];

  if (!question) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 text-center">
          <p>No questions available for this test</p>
          <Button onClick={() => navigate('/mock-tests')} className="mt-4">
            Back to Mock Tests
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-4 max-w-3xl">
        {/* Header */}
        <div className="glass rounded-xl p-4 mb-6 flex items-center justify-between">
          <div className="text-sm">
            Question {currentQuestion + 1}/{questions.length}
          </div>
          <div className={`flex items-center gap-2 font-medium ${
            timeLeft < 60 ? 'text-destructive' : 'text-foreground'
          }`}>
            <Clock className="h-4 w-4" />
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Progress */}
        <Progress value={(currentQuestion + 1) / questions.length * 100} className="mb-6 h-2" />

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="glass rounded-2xl p-6"
          >
            <h2 className="text-lg md:text-xl font-medium mb-6">
              {question.question_text}
            </h2>

            <div className="space-y-3">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => selectAnswer(index)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    answers[currentQuestion] === index
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 ${
                      answers[currentQuestion] === index
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-muted-foreground/30'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </span>
                    {option}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {currentQuestion === questions.length - 1 ? (
            <Button onClick={submitTest} className="gradient-primary border-0">
              Submit Test
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentQuestion((prev) => Math.min(questions.length - 1, prev + 1))}
              className="gradient-primary border-0"
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>

        {/* Question Navigator */}
        <div className="glass rounded-xl p-4 mt-6">
          <div className="text-sm font-medium mb-3">Questions</div>
          <div className="flex flex-wrap gap-2">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                  currentQuestion === index
                    ? 'bg-primary text-primary-foreground'
                    : answers[index] !== null
                    ? 'bg-success/20 text-success'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
