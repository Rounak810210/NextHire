import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import MCQPractice from './MCQPractice';

interface Question {
  id: number;
  question: string;
  role: string;
}

interface Feedback {
  feedback: string;
  score?: number;
}

const PracticePage = () => {
  const { role } = useParams<{ role: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'interview' | 'mcq'>('mcq');
  const [question, setQuestion] = useState<Question | null>(null);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestion = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:5000/api/questions?role=${role}`);
      if (!response.ok) throw new Error('Failed to fetch question');
      const data = await response.json();
      setQuestion(data);
    } catch (err) {
      setError('Failed to load question. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!question || !answer.trim()) return;

    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          question: question.question,
          answer: answer,
          role: role,
        }),
      });

      if (!response.ok) throw new Error('Failed to submit answer');
      const data = await response.json();
      setFeedback(data);
    } catch (err) {
      setError('Failed to submit answer. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextQuestion = () => {
    setAnswer('');
    setFeedback(null);
    fetchQuestion();
  };

  useEffect(() => {
    if (activeTab === 'interview') {
      fetchQuestion();
    }
  }, [role, activeTab]);

  if (error) {
    return (
      <div className="page-container">
        <div className="content-container">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button onClick={fetchQuestion} className="btn-primary">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="content-container max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="space-y-8"
        >
          <div className="flex items-center justify-between">
            <h1 className="heading-2">{role} Practice</h1>
            <button
              onClick={() => navigate('/roles')}
              className="btn-secondary"
            >
              Change Role
            </button>
          </div>

          <div className="flex space-x-4 mb-6">
            <button
              className={`btn ${activeTab === 'mcq' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('mcq')}
            >
              MCQ Practice
            </button>
            <button
              className={`btn ${activeTab === 'interview' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('interview')}
            >
              Interview Practice
            </button>
          </div>

          {activeTab === 'mcq' ? (
            <MCQPractice role={role || ''} />
          ) : (
            <div className="card space-y-6">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-white">
                      {question?.question}
                    </h2>
                    <textarea
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      placeholder="Type your answer here..."
                      className="input min-h-[200px]"
                      disabled={!!feedback}
                    />
                  </div>

                  {!feedback ? (
                    <button
                      onClick={submitAnswer}
                      disabled={!answer.trim() || isLoading}
                      className="btn-primary w-full"
                    >
                      Submit Answer
                    </button>
                  ) : (
                    <div className="space-y-6">
                      <div className="p-4 bg-gray-700/50 rounded-lg">
                        <h3 className="text-lg font-semibold mb-2">Feedback</h3>
                        <p className="text-body whitespace-pre-line">{feedback.feedback}</p>
                      </div>
                      <button
                        onClick={handleNextQuestion}
                        className="btn-primary w-full"
                      >
                        Next Question
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default PracticePage; 