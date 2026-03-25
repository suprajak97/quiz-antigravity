const API_URL = 'https://opentdb.com/api.php?amount=10&category=9&difficulty=easy&type=multiple';

/**
 * Decodes HTML entities from strings.
 * The Trivia API returns some characters as HTML entities (e.g. &quot;).
 */
const decodeHtml = (html) => {
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
};

export const fetchTriviaQuestions = async () => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error('Failed to fetch trivia questions');
    }
    const data = await response.json();
    
    return data.results.map((q) => {
      const decodedQuestion = decodeHtml(q.question);
      const decodedCorrectAnswer = decodeHtml(q.correct_answer);
      const decodedIncorrectAnswers = q.incorrect_answers.map(decodeHtml);
      
      // Shuffle answers
      const allAnswers = [...decodedIncorrectAnswers, decodedCorrectAnswer]
        .sort(() => Math.random() - 0.5);
      
      return {
        question: decodedQuestion,
        correctAnswer: decodedCorrectAnswer,
        answers: allAnswers,
        difficulty: q.difficulty,
        category: q.category
      };
    });
  } catch (error) {
    console.error('Error fetching trivia questions:', error);
    throw error;
  }
};
