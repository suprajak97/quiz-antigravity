import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, RefreshCw, Play, ChevronRight, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { fetchTriviaQuestions } from './services/triviaService';

const Particles = () => {
  const particles = Array.from({ length: 20 });
  return (
    <div className="particles-container">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          className="particle"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            scale: Math.random() * 0.5 + 0.2,
          }}
          animate={{
            y: [null, Math.random() * -100 - 50],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            width: Math.random() * 10 + 5 + 'px',
            height: Math.random() * 10 + 5 + 'px',
          }}
        />
      ))}
    </div>
  );
};

const Timer = ({ timeLeft, maxTime }) => {
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (timeLeft / maxTime) * circumference;

  return (
    <div className="timer-container">
      <div className="timer-circle">
        <svg width="40" height="40" viewBox="0 0 40 40">
          <circle className="timer-bg" cx="20" cy="20" r={radius} />
          <motion.circle
            className="timer-progress"
            cx="20"
            cy="20"
            r={radius}
            strokeDasharray={circumference}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: "linear" }}
          />
        </svg>
      </div>
      <span>{timeLeft}s</span>
    </div>
  );
};

const Confetti = () => {
  const pieces = Array.from({ length: 50 });
  const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'];
  
  return (
    <div className="confetti-container">
      {pieces.map((_, i) => (
        <motion.div
          key={i}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
          animate={{
            x: (Math.random() - 0.5) * 800,
            y: (Math.random() - 0.5) * 800,
            opacity: 0,
            scale: Math.random() * 1.5 + 0.5,
            rotate: Math.random() * 720,
          }}
          transition={{ duration: 2.5, ease: "easeOut" }}
          style={{
            position: 'absolute',
            width: '10px',
            height: '10px',
            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          }}
        />
      ))}
    </div>
  );
};

function App() {
  const [status, setStatus] = useState('idle'); // idle, loading, playing, finished, error
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [showConfetti, setShowConfetti] = useState(false);

  const MAX_TIME = 15;

  useEffect(() => {
    let timer;
    if (status === 'playing' && selectedAnswer === null && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && selectedAnswer === null) {
      handleAnswer(null); // Time's up!
    }
    return () => clearInterval(timer);
  }, [status, selectedAnswer, timeLeft]);

  const startQuiz = async () => {
    setStatus('loading');
    setShowConfetti(false);
    try {
      const data = await fetchTriviaQuestions();
      setQuestions(data);
      setCurrentIdx(0);
      setScore(0);
      setTimeLeft(MAX_TIME);
      setStatus('playing');
    } catch (err) {
      setStatus('error');
    }
  };

  const handleAnswer = (answer) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(answer);
    const correct = answer === questions[currentIdx].correctAnswer;
    setIsCorrect(correct);
    if (correct) setScore(s => s + 1);
    
    setTimeout(() => {
      if (currentIdx < questions.length - 1) {
        setCurrentIdx(i => i + 1);
        setSelectedAnswer(null);
        setIsCorrect(null);
        setTimeLeft(MAX_TIME);
      } else {
        setStatus('finished');
        if (score + (correct ? 1 : 0) >= 7) setShowConfetti(true);
      }
    }, 1500);
  };

  const progress = questions.length ? ((currentIdx) / questions.length) * 100 : 0;

  return (
    <div className="app-container">
      <div className="bg-glow-1"></div>
      <div className="bg-glow-2"></div>
      <Particles />
      
      <AnimatePresence mode="wait">
        {status === 'idle' && (
          <motion.div 
            key="idle"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="glass-card"
          >
            <h1>Trivia Master</h1>
            <h2>Test your knowledge with 10 random questions from across various categories!</h2>
            <button className="btn btn-primary" style={{ margin: '0 auto' }} onClick={startQuiz}>
              <Play size={20} /> Start Quiz
            </button>
          </motion.div>
        )}

        {status === 'loading' && (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center"
          >
            <div className="loader"></div>
            <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Gathering questions...</p>
          </motion.div>
        )}

        {status === 'playing' && questions[currentIdx] && (
          <motion.div 
            key={currentIdx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={`glass-card ${selectedAnswer && !isCorrect ? 'shake' : ''}`}
          >
            <div className="progress-container" style={{ marginBottom: '1rem' }}>
              <motion.div 
                className="progress-fill"
                initial={{ width: `${progress}%` }}
                animate={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.05em' }}>
                <span>QUESTION {currentIdx + 1} / {questions.length}</span>
                <span style={{ display: 'block', textTransform: 'uppercase', marginTop: '2px' }}>{questions[currentIdx].category}</span>
              </div>
              <Timer timeLeft={timeLeft} maxTime={MAX_TIME} />
            </div>
            
            <h2 dangerouslySetInnerHTML={{ __html: questions[currentIdx].question }}></h2>
            
            <div className="options-grid">
              {questions[currentIdx].answers.map((answer, i) => {
                const isSelected = selectedAnswer === answer;
                const isCorrectAns = answer === questions[currentIdx].correctAnswer;
                
                let className = "option-btn";
                if (selectedAnswer) {
                  if (isSelected) {
                    className += isCorrect ? " correct" : " incorrect";
                  } else if (isCorrectAns) {
                    className += " correct";
                  }
                }
                
                return (
                  <motion.button 
                    key={i} 
                    className={className}
                    whileHover={!selectedAnswer ? { x: 10, backgroundColor: 'rgba(255, 255, 255, 0.08)' } : {}}
                    whileTap={!selectedAnswer ? { scale: 0.98 } : {}}
                    onClick={() => handleAnswer(answer)}
                    disabled={selectedAnswer !== null}
                    dangerouslySetInnerHTML={{ __html: answer }}
                  />
                );
              })}
            </div>
          </motion.div>
        )}

        {status === 'finished' && (
          <motion.div 
            key="finished"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card"
            style={{ textAlign: 'center', position: 'relative' }}
          >
            {showConfetti && <Confetti />}
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
              style={{ display: 'inline-flex', padding: '1.5rem', background: 'rgba(255, 215, 0, 0.1)', borderRadius: '50%', marginBottom: '1.5rem', position: 'relative', zIndex: 11 }}
            >
              <Trophy size={48} color="#FFD700" />
            </motion.div>
            <h1 style={{ position: 'relative', zIndex: 11 }}>Quiz Completed!</h1>
            <p style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>
              You scored <span style={{ color: 'var(--accent-blue)', fontWeight: 'bold' }}>{score}</span> out of {questions.length}
            </p>
            
            <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '16px', marginBottom: '2rem' }}>
              <p style={{ color: 'var(--text-secondary)' }}>
                {score >= 8 ? "Excellent! You're a true Trivia Master!" : 
                 score >= 5 ? "Good job! You have a solid knowledge base." : 
                 "Keep learning and try again!"}
              </p>
            </div>

            <button className="btn btn-primary" style={{ margin: '0 auto' }} onClick={startQuiz}>
              <RefreshCw size={20} /> Play Again
            </button>
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div 
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card"
            style={{ textAlign: 'center' }}
          >
            <XCircle size={48} color="var(--error)" style={{ marginBottom: '1.5rem' }} />
            <h1>Oops!</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Failed to load questions. Please check your connection and try again.</p>
            <button className="btn btn-primary" style={{ margin: '0 auto' }} onClick={startQuiz}>
              Retry
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
