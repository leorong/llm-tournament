import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const fetchQuestions = async () => {
  return await axios.get(`${API_BASE_URL}/questions/list`);
};

export const createQuestion = async (text: string, prompts: string[]) => {
  return await axios.post(`${API_BASE_URL}/questions`, {
    text,
    prompts,
  });
};

export const fetchQuestionDetails = async (questionId: string) => {
  return await axios.get(`${API_BASE_URL}/questions/${questionId}/prompts`);
};

export const addPrompts = async (questionId: string, prompts: string[]) => {
  return await axios.post(`${API_BASE_URL}/questions/${questionId}/prompts`, { prompts });
};

export const generateMatchup = async (questionId: string) => {
  return await axios.post(`${API_BASE_URL}/questions/${questionId}/generate-matchup`);
};

export const voteForMatchup = async (matchupId: string, winnerPromptId: string) => {
  return await axios.post(`${API_BASE_URL}/matchups/${matchupId}/vote`, { winner_prompt_id: winnerPromptId });
};