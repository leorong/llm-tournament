import React, { useState } from 'react';
import { createQuestion } from '../api';
import './CreateQuestionModal.css';

interface CreateQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuestionCreated: () => void;
}

const CreateQuestionModal: React.FC<CreateQuestionModalProps> = ({ isOpen, onClose, onQuestionCreated }) => {
  const [questionText, setQuestionText] = useState('');
  const [prompts, setPrompts] = useState<string[]>(['']);
  const [error, setError] = useState<string | null>(null);

  const handlePromptChange = (index: number, value: string) => {
    const newPrompts = [...prompts];
    newPrompts[index] = value;
    setPrompts(newPrompts);
  };

  const addPromptField = () => {
    setPrompts([...prompts, '']);
  };

  const removePromptField = (index: number) => {
    const newPrompts = prompts.filter((_, i) => i !== index);
    setPrompts(newPrompts);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!questionText.trim()) {
      setError('Question text is required.');
      return;
    }

    const validPrompts = prompts.filter((prompt) => prompt.trim() !== '');

    try {
      await createQuestion(questionText, validPrompts);
      setQuestionText('');
      setPrompts(['']);
      onQuestionCreated();
      onClose();
    } catch (err) {
      setError('Failed to create question. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Create New Question</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="Enter question text"
          />

          <h3>Prompts</h3>
          {prompts.map((prompt, index) => (
            <div key={index} className="prompt-input">
              <input
                type="text"
                value={prompt}
                onChange={(e) => handlePromptChange(index, e.target.value)}
                placeholder={`Enter prompt ${index + 1}`}
              />
              <button type="button" onClick={() => removePromptField(index)} className="remove-button">
                Remove
              </button>
            </div>
          ))}

          <button type="button" onClick={addPromptField} className="add-button">
            Add Another Prompt
          </button>

          {error && <p className="error">{error}</p>}

          <div className="button-group">
            <button type="submit">Create</button>
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateQuestionModal;
