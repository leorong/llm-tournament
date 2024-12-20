import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchQuestionDetails, addPrompts, generateMatchup, voteForMatchup } from '../api';
import './QuestionDetails.css';

interface Prompt {
  id: string;
  text: string;
  score: number;
  created_at: string;
}

interface Matchup {
  id: string;
  prompt1: {
    id: string;
    text: string;
  }
  output1: string;
  prompt2: {
    id: string;
    text: string;
  }
  output2: string;
}

interface Question {
  id: string;
  text: string;
  created_at: string;
  prompts: Prompt[];
}

const QuestionDetails: React.FC = () => {
  const { questionId } = useParams<{ questionId: string }>();
  const [question, setQuestion] = useState<Question | null>(null);
  const [newPrompt, setNewPrompt] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [matchup, setMatchup] = useState<Matchup | null>(null);
  const [loadingMatchup, setLoadingMatchup] = useState(false);
  const [voting, setVoting] = useState(false);
  const navigate = useNavigate();

  const loadQuestionDetails = async () => {
    try {
      const response = await fetchQuestionDetails(questionId!);
      setQuestion(response.data);
    } catch (err) {
      setError('Failed to fetch question details.');
    }
  };

  useEffect(() => {
    loadQuestionDetails();
  }, [questionId]);

  const handleAddPrompt = async () => {
    if (!newPrompt.trim()) return;
    await addPrompts(questionId!, [newPrompt]);
    setNewPrompt('');
    loadQuestionDetails();
  };

  const handleGenerateMatchup = async () => {
    setMatchup(null);
    setLoadingMatchup(true);
    try {
      const response = await generateMatchup(questionId!);
      setMatchup(response.data.matchup);
    } catch (err) {
      setError('Failed to generate matchup.');
    } finally {
      setLoadingMatchup(false);
    }
  };

  const handleVote = async (winner: 'prompt1' | 'prompt2') => {
    if (!matchup) return;
    setVoting(true);
    try {
      await voteForMatchup(matchup.id, winner === 'prompt1' ? matchup.prompt1.id : matchup.prompt2.id);
      setMatchup(null);
      loadQuestionDetails();
    } catch (err) {
      setError('Failed to record vote.');
    } finally {
      setVoting(false);
    }
  };

  return (
    <div className="question-details-container">
      <button onClick={() => navigate('/')} className="back-button">
        Back to Questions
      </button>
      {error && <p className="error">{error}</p>}
      {question && (
        <>
          <h1 className="question-title">{question.text}</h1>
          <p className="question-meta">Created At: {new Date(question.created_at).toLocaleString()}</p>

          <h2 className="prompt-header">Prompts</h2>
          <table className="prompt-table">
            <thead>
              <tr>
                <th>Prompt Text</th>
                <th>Score</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {question.prompts.map((prompt) => (
                <tr key={prompt.id}>
                  <td>{prompt.text}</td>
                  <td>{prompt.score}</td>
                  <td>{new Date(prompt.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="add-prompt-section">
            <input
              type="text"
              value={newPrompt}
              onChange={(e) => setNewPrompt(e.target.value)}
              placeholder="Enter new prompt"
            />
            <button onClick={handleAddPrompt} className="add-prompt-button">
              Add Prompt
            </button>
          </div>

          <button
            onClick={handleGenerateMatchup}
            className="generate-matchup-button"
            disabled={loadingMatchup || question.prompts.length < 2}
          >
            {loadingMatchup ? 'Generating Matchup...' : 'Generate Matchup'}
          </button>

          {matchup && (
            <div className="matchup-section">
              <h2 className="matchup-header">Vote for the better Prompt</h2>
              <div className="matchup">
                <div className="option">
                  <h4>Prompt 1</h4>
                  <p>{matchup.prompt1.text}</p>
                  <p className="output">{matchup.output1}</p>
                  <button onClick={() => handleVote('prompt1')} disabled={voting} className="vote-button">
                    Vote for Prompt 1
                  </button>
                </div>
                <div className="option">
                  <h4>Prompt 2</h4>
                  <p>{matchup.prompt2.text}</p>
                  <p className="output">{matchup.output2}</p>
                  <button onClick={() => handleVote('prompt2')} disabled={voting} className="vote-button">
                    Vote for Prompt 2
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default QuestionDetails;
