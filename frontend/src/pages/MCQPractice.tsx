import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './MCQPractice.module.css';

interface MCQ {
  id: number;
  topic: string;
  question: string;
  options: Record<string, string>;
  correct_answer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

const MCQPractice: React.FC<{ role: string }> = ({ role }) => {
  const [mcqs, setMcqs] = useState<MCQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [showExplanations, setShowExplanations] = useState<Record<number, boolean>>({});
  const [generating, setGenerating] = useState(false);

  const topics = ['all', 'Data Structures', 'OOP', 'System Design', 'Web Development', 'Databases', 'Clean Code'];
  const difficulties = ['all', 'easy', 'medium', 'hard'];

  useEffect(() => {
    fetchMCQs();
  }, [role, selectedTopic, selectedDifficulty]);

  const fetchMCQs = async () => {
    try {
      setLoading(true);
      let url = `http://localhost:5000/api/mcq/${role}`;
      if (selectedTopic !== 'all') {
        url += `?topic=${selectedTopic}`;
      }
      if (selectedDifficulty !== 'all') {
        url += `${selectedTopic !== 'all' ? '&' : '?'}difficulty=${selectedDifficulty}`;
      }
      const response = await axios.get(url);
      setMcqs(response.data.mcqs || []);
      setUserAnswers({});
      setShowExplanations({});
    } catch (err) {
      setError('Failed to load MCQs');
      console.error('Error fetching MCQs:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateNewQuestion = async () => {
    try {
      setGenerating(true);
      const response = await axios.post(`http://localhost:5000/api/mcq/generate`, {
        role,
        topic: selectedTopic === 'all' ? undefined : selectedTopic,
        difficulty: selectedDifficulty === 'all' ? undefined : selectedDifficulty
      });
      if (response.data.question) {
        setMcqs(prev => [...prev, response.data]);
      }
    } catch (err) {
      setError('Failed to generate new question');
      console.error('Error generating question:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleAnswerSelect = (mcqId: number, answer: string) => {
    if (!userAnswers[mcqId]) {
      setUserAnswers(prev => ({ ...prev, [mcqId]: answer }));
      setShowExplanations(prev => ({ ...prev, [mcqId]: true }));
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading questions...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.mcqContainer}>
      <div className={styles.header}>
        <h1>Practice MCQs</h1>
        <div className={styles.filters}>
          <select
            className={styles.select}
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
          >
            {topics.map(topic => (
              <option key={topic} value={topic}>
                {topic === 'all' ? 'All Topics' : topic}
              </option>
            ))}
          </select>
          <select
            className={styles.select}
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
          >
            {difficulties.map(difficulty => (
              <option key={difficulty} value={difficulty}>
                {difficulty === 'all' ? 'All Difficulties' : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </option>
            ))}
          </select>
          <button
            className={styles.generateButton}
            onClick={generateNewQuestion}
            disabled={generating}
          >
            {generating ? 'Generating...' : 'Generate New Question'}
          </button>
        </div>
      </div>

      <div className={styles.questions}>
        {mcqs.map((mcq) => (
          <div key={mcq.id} className={styles.questionCard}>
            <div className={styles.questionHeader}>
              <span className={styles.topic}>{mcq.topic}</span>
              <span className={`${styles.difficulty} ${styles[mcq.difficulty]}`}>
                {mcq.difficulty.charAt(0).toUpperCase() + mcq.difficulty.slice(1)}
              </span>
            </div>
            <div className={styles.question}>{mcq.question}</div>
            <div className={styles.options}>
              {Object.entries(mcq.options).map(([key, value]) => (
                <button
                  key={key}
                  className={`${styles.optionButton} ${
                    userAnswers[mcq.id] === key
                      ? userAnswers[mcq.id] === mcq.correct_answer
                        ? styles.correct
                        : styles.incorrect
                      : userAnswers[mcq.id] && key === mcq.correct_answer
                      ? styles.correct
                      : ''
                  } ${userAnswers[mcq.id] ? '' : styles.selected}`}
                  onClick={() => handleAnswerSelect(mcq.id, key)}
                  disabled={!!userAnswers[mcq.id]}
                >
                  {key}. {value}
                </button>
              ))}
            </div>
            {showExplanations[mcq.id] && (
              <div className={`${styles.feedback} ${
                userAnswers[mcq.id] === mcq.correct_answer
                  ? styles.correctFeedback
                  : styles.incorrectFeedback
              }`}>
                {mcq.explanation}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MCQPractice; 