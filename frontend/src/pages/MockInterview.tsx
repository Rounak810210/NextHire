import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface Question {
  id: string;
  question: string;
  role: string;
}

interface Feedback {
  feedback: string;
  score?: number;
}

const MockInterview = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const selectedRole = sessionStorage.getItem('selectedRole') || 'sde';

  useEffect(() => {
    fetchNextQuestion();
  }, []);

  const fetchNextQuestion = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setFeedback(null);
      setAnswer('');

      const response = await axios.get(`http://localhost:5000/api/questions?role=${selectedRole}`);
      setCurrentQuestion(response.data);
    } catch (err) {
      setError('Failed to fetch question. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!answer.trim()) return;

    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      const response = await axios.post('http://localhost:5000/api/evaluate', {
        question: currentQuestion?.question,
        answer,
        role: selectedRole,
      }, config);

      setFeedback(response.data);
    } catch (err) {
      setError('Failed to evaluate answer. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.3,
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto"
    >
      <div className="text-center mb-8">
        <h1 className="heading-1 mb-4">Mock Interview</h1>
        <p className="text-body max-w-2xl mx-auto">
          Answer the questions as if you were in a real interview. We'll provide feedback on your responses.
        </p>
      </div>

      <div className="card mb-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Question {currentQuestion ? (currentQuestion as Question).id : ''} of 5
          </span>
          <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
            {Math.round((currentQuestion ? (currentQuestion as Question).id : 0 / 5) * 100)}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-6">
          <div
            className="bg-primary-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${(currentQuestion ? (currentQuestion as Question).id : 0 / 5) * 100}%` }}
          ></div>
        </div>

        <h2 className="heading-2 mb-4">
          {currentQuestion ? (currentQuestion as Question).question : 'Loading...'}
        </h2>
        
        <div className="space-y-4">
          <p className="text-body">
            Focus on:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>The specific challenges you faced</li>
              <li>Your approach to solving problems</li>
              <li>The outcome and what you learned</li>
            </ul>
          </p>

          <div className="flex items-center justify-center mt-8 space-x-4">
            <button
              className={`btn-primary ${isRecording ? 'bg-red-600 hover:bg-red-700' : ''}`}
              onClick={() => setIsRecording(!isRecording)}
            >
              {isRecording ? 'Stop Recording' : 'Start Recording'}
            </button>
            <button
              className="btn-secondary"
              onClick={() => setCurrentQuestion(prev => (prev as Question) ? { ...prev, id: (prev as Question).id ? (parseInt(prev.id) + 1).toString() : '1' } : null)}
            >
              Next Question
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center items-center min-h-[400px]"
          >
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </motion.div>
        ) : error ? (
          <motion.div
            key="error"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="text-red-600 text-center py-8"
          >
            {error}
          </motion.div>
        ) : (
          <motion.div
            key="content"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="card mb-8">
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your answer here..."
                className="input min-h-[200px] mb-4"
                disabled={!!feedback}
              />
              {!feedback ? (
                <button
                  onClick={handleSubmit}
                  className="btn-primary w-full"
                  disabled={!answer.trim()}
                >
                  Submit Answer
                </button>
              ) : (
                <button onClick={fetchNextQuestion} className="btn-primary w-full">
                  Next Question
                </button>
              )}
            </div>

            <AnimatePresence>
              {feedback && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="card bg-primary-50 dark:bg-gray-800"
                >
                  <h3 className="text-xl font-semibold mb-4">Feedback</h3>
                  <div className="prose dark:prose-invert">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                      {feedback.feedback}
                    </p>
                  </div>
                  {feedback.score && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-lg font-medium">
                        Score: {feedback.score}/10
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MockInterview; 