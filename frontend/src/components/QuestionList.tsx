import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchQuestions } from '../api';
import CreateQuestionModal from './CreateQuestionModal';
import './QuestionList.css'; // Import the CSS file for styling

interface Question {
  id: string;
  text: string;
  created_at: string;
  num_prompts: number;
}

const QuestionList: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const response = await fetchQuestions();
      setQuestions(response.data);  
    } catch (err) {
      setError('Failed to fetch questions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  const handleQuestionCreated = () => {
    loadQuestions();
  };

  return (
    <div className="question-list-container">
      <button className="create-button" onClick={() => setIsModalOpen(true)}>
        Create New Question
      </button>
      {loading && <p className="loading">Loading...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && (
        <table className="question-table">
          <thead>
            <tr>
              <th>Question</th>
              <th>Number of Prompts</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((q) => (
              <tr key={q.id} onClick={() => navigate(`/questions/${encodeURIComponent(q.id)}`)} className="clickable-row">
                <td>{q.text}</td>
                <td>{q.num_prompts}</td>
                <td>{q.created_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <CreateQuestionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onQuestionCreated={handleQuestionCreated}
      />
    </div>
  );
};

export default QuestionList;
