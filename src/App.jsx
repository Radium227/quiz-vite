import React, { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import './App.css';

const genAI = new GoogleGenerativeAI('AIzaSyDbg4jLYHtMyllWAxPz8gdtnMX5CnK7OEA');

function App() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [answerState, setAnswerState] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const generateQuestions = async () => {
    try {
      setIsLoading(true);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = "Generate 15 multiple-choice questions about financial literacy for indian college students. Each question should have 4 options with one correct answer. Format the response as a JSON array where each question object has properties: 'question', 'options' (array of 4 strings), and 'correctAnswer' (index of the correct option).";
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();
      
      text = text.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim();
      
      const parsedQuestions = JSON.parse(text);
      setQuestions(parsedQuestions);
    } catch (error) {
      console.error('Error generating questions:', error);
      setError(`Failed to generate questions: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartQuiz = () => {
    setQuizStarted(true);
    generateQuestions();
  };

  const handleRetakeQuiz = () => {
    setQuizStarted(true);
    setShowScore(false);
    setCurrentQuestion(0);
    setScore(0);
    setAnswerState(null);
    setSelectedAnswer(null);
    generateQuestions();
  };

  const handleAnswerClick = (selectedIndex) => {
    setSelectedAnswer(selectedIndex);
    const currentQ = questions[currentQuestion];
    const isCorrect = selectedIndex === currentQ.correctAnswer;
    setAnswerState(isCorrect ? 'correct' : 'incorrect');
    if (isCorrect) {
      setScore(score + 1);
    }

    setTimeout(() => {
      const nextQuestion = currentQuestion + 1;
      if (nextQuestion < questions.length) {
        setCurrentQuestion(nextQuestion);
        setAnswerState(null);
        setSelectedAnswer(null);
      } else {
        setShowScore(true);
      }
    }, 1500);
  };

  const getScoreFeedback = () => {
    const percentage = (score / questions.length) * 100;
    if (percentage >= 80) {
      return "Excellent! You have very good financial knowledge.";
    } else if (percentage >= 60) {
      return "Good job! You have a solid foundation, but there's room for improvement.";
    } else {
      return "You might want to brush up on your financial knowledge. Keep learning!";
    }
  };

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!quizStarted) {
    return (
      <div className="start-screen">
        <h1>Financial Literacy Quiz</h1>
        <p>Test your knowledge of personal finance!</p>
        <button onClick={handleStartQuiz}>Start Quiz</button>
      </div>
    );
  }

  if (isLoading) {
    return <div className="loading-message">Loading questions... Please wait.</div>;
  }

  return (
    <div className="app">
      {showScore ? (
        <div className="score-section">
          <h2>Quiz Completed! ✅</h2>
          <p>You scored {score} out of {questions.length}</p>
          <p>{getScoreFeedback()}</p>
          <button onClick={handleRetakeQuiz}>Retake Quiz</button>
        </div>
      ) : questions.length > 0 ? (
        <>
          <div className="question-section">
            <div className="question-count">
              <span>Question {currentQuestion + 1}</span>/{questions.length}
            </div>
            <div className="question-text">{questions[currentQuestion].question}</div>
          </div>
          <div className="answer-section">
            {questions[currentQuestion].options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerClick(index)}
                className={`answer-button ${
                  selectedAnswer === index
                    ? answerState === 'correct'
                      ? 'correct'
                      : 'incorrect'
                    : ''
                } ${
                  answerState === 'incorrect' && index === questions[currentQuestion].correctAnswer
                    ? 'highlight-correct'
                    : ''
                }`}
                disabled={answerState !== null}
              >
                {option}
                {selectedAnswer === index && answerState === 'correct' && ' ✅'}
                {selectedAnswer === index && answerState === 'incorrect' && ' ❌'}
                {answerState === 'incorrect' && index === questions[currentQuestion].correctAnswer && ' (Correct Answer)'}
              </button>
            ))}
          </div>
        </>
      ) : (
        <div>No questions available. Try refreshing the page.</div>
      )}
    </div>
  );
}

export default App;