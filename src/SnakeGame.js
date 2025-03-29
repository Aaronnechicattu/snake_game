import React, { useState, useEffect, useRef } from 'react';
import './SnakeGame.css';

const SnakeGame = () => {
  const [snake, setSnake] = useState([[5, 5]]);
  const [food, setFood] = useState([10, 10]);
  const [direction, setDirection] = useState('RIGHT');
  const [gameOver, setGameOver] = useState(false);
  const [powerFood, setPowerFood] = useState(null);
  const [powerFoodTimeLeft, setPowerFoodTimeLeft] = useState(0);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [speed, setSpeed] = useState(300); // Initial speed
  const [badFood, setBadFood] = useState(null);
  const [badFoodTimeLeft, setBadFoodTimeLeft] = useState(0);
  const badFoodTimer = useRef(null);
  const powerFoodTimer = useRef(null);

  useEffect(() => {
    if (score < 0) {
      setGameOver(true);
    }
  }, [score]);

  useEffect(() => {
    if (powerFood) {
      let timeLeft = 5;
      setPowerFoodTimeLeft(timeLeft);

      const timerInterval = setInterval(() => {
        timeLeft -= 1;
        setPowerFoodTimeLeft(timeLeft);
        if (timeLeft <= 0) {
          clearInterval(timerInterval);
          setPowerFood(null);
        }
      }, 1000);

      return () => clearInterval(timerInterval);
    } else {
      setPowerFoodTimeLeft(0);
    }
  }, [powerFood]);

  useEffect(() => {
    if (badFood) {
      let timeLeft = 5;
      setBadFoodTimeLeft(timeLeft);

      const timerInterval = setInterval(() => {
        timeLeft -= 1;
        setBadFoodTimeLeft(timeLeft);
        if (timeLeft <= 0) {
          clearInterval(timerInterval);
          setBadFood(null);
        }
      }, 1000);

      return () => clearInterval(timerInterval);
    } else {
      setBadFoodTimeLeft(0);
    }
  }, [badFood]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowUp':
          if (direction !== 'DOWN') setDirection('UP');
          break;
        case 'ArrowDown':
          if (direction !== 'UP') setDirection('DOWN');
          break;
        case 'ArrowLeft':
          if (direction !== 'RIGHT') setDirection('LEFT');
          break;
        case 'ArrowRight':
          if (direction !== 'LEFT') setDirection('RIGHT');
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [direction]);

  useEffect(() => {
    if (score > 0 && score % 10 === 0) {
      setLevel(Math.floor(score / 10) + 1);
      setSpeed((prevSpeed) => Math.max(50, prevSpeed - 50)); // Decrease interval, minimum 50ms
    }
  }, [score]);

  useEffect(() => {
    if (!powerFood && Math.random() < 0.1) {
      let newPowerFood;
      do {
        newPowerFood = [
          Math.floor(Math.random() * 20),
          Math.floor(Math.random() * 20)
        ];
      } while (
        snake.some(segment => segment[0] === newPowerFood[0] && segment[1] === newPowerFood[1]) ||
        (food[0] === newPowerFood[0] && food[1] === newPowerFood[1]) ||
        (badFood && badFood[0] === newPowerFood[0] && badFood[1] === newPowerFood[1])
      );
      setPowerFood(newPowerFood);
    }
  }, [snake, food, badFood, powerFood]);

  useEffect(() => {
    if (!badFood && Math.random() < 0.1) {
      let newBadFood;
      do {
        newBadFood = [
          Math.floor(Math.random() * 20),
          Math.floor(Math.random() * 20)
        ];
      } while (
        snake.some(segment => segment[0] === newBadFood[0] && segment[1] === newBadFood[1]) ||
        (food[0] === newBadFood[0] && food[1] === newBadFood[1]) ||
        (powerFood && powerFood[0] === newBadFood[0] && powerFood[1] === newBadFood[1])
      );
      setBadFood(newBadFood);
    }
  }, [snake, food, powerFood, badFood]);

  useEffect(() => {
    const moveSnake = () => {
      const newSnake = [...snake];
      const head = newSnake[newSnake.length - 1];
      let newHead;

      switch (direction) {
        case 'UP':
          newHead = [head[0] - 1, head[1]];
          break;
        case 'DOWN':
          newHead = [head[0] + 1, head[1]];
          break;
        case 'LEFT':
          newHead = [head[0], head[1] - 1];
          break;
        case 'RIGHT':
          newHead = [head[0], head[1] + 1];
          break;
        default:
          return;
      }

      newSnake.push(newHead);
      if (newHead[0] === food[0] && newHead[1] === food[1]) {
        let newFood;
        do {
          newFood = [
            Math.floor(Math.random() * 20),
            Math.floor(Math.random() * 20)
          ];
        } while (newSnake.some(segment => segment[0] === newFood[0] && segment[1] === newFood[1]));
        setFood(newFood);
        setScore(score + 1);
      } else {
        newSnake.shift();
      }

      if (badFood && newHead[0] === badFood[0] && newHead[1] === badFood[1]) {
        setBadFood(null);
        setScore(score - 2);
      }

      if (powerFood && newHead[0] === powerFood[0] && newHead[1] === powerFood[1]) {
        setPowerFood(null);
        for (let i = 0; i < 3; i++) {
          const tail = newSnake[0];
          const secondSegment = newSnake[1] || [tail[0] - 1, tail[1]]; // Default to a valid direction
          const newSegment = [
            tail[0] + (tail[0] - secondSegment[0]),
            tail[1] + (tail[1] - secondSegment[1])
          ];
          newSnake.unshift(newSegment);
        }
        setScore(score + 3);
      }

      if (
        newHead[0] < 0 ||
        newHead[1] < 0 ||
        newHead[0] >= 20 ||
        newHead[1] >= 20 ||
        newSnake.slice(0, -1).some(segment => segment[0] === newHead[0] && segment[1] === newHead[1])
      ) {
        setGameOver(true);
        return;
      }

      setSnake(newSnake);
    };

    if (!gameOver) {
      const interval = setInterval(moveSnake, speed);
      return () => clearInterval(interval);
    }
  }, [snake, direction, food, powerFood, badFood, gameOver, speed]);

  // Ensure the snake head class is applied correctly
  const isSnakeHead = (row, col) => {
    const head = snake[snake.length - 1];
    return head[0] === row && head[1] === col;
  };

  const restartGame = () => {
    setSnake([[5, 5]]);
    setFood([10, 10]);
    setDirection('RIGHT');
    setGameOver(false);
    setPowerFood(null);
    setPowerFoodTimeLeft(0);
    setScore(0);
    setLevel(1);
    setSpeed(300);
    setBadFood(null);
    setBadFoodTimeLeft(0);
  };

  return (
    <div className="game-container fun-theme">
      {gameOver ? (
        <div className="game-over-menu fun-text">
          <div>Game Over</div>
          <button className="play-again-button fun-buttons" onClick={restartGame}>Play Again</button>
        </div>
      ) : (
        <>
          {powerFood && (
            <div className="timer-bar">
              <div
                className="timer-bar-fill animated-gradient"
                style={{ width: `${(powerFoodTimeLeft / 5) * 100}%` }}
              ></div>
            </div>
          )}
          {badFood && (
            <div className="timer-bar bad-food-timer">
              <div
                className="timer-bar-fill animated-gradient bad-food"
                style={{ width: `${(badFoodTimeLeft / 5) * 100}%` }}
              ></div>
            </div>
          )}
          <div className="game-board fun-grid">
            {Array.from({ length: 20 }).map((_, row) => (
              <div key={row} className="row">
                {Array.from({ length: 20 }).map((_, col) => (
                  <div
                    key={col}
                    className={`cell ${
                      isSnakeHead(row, col)
                        ? 'snake-head-with-eyes animated-snake'
                        : snake.some((segment) => segment[0] === row && segment[1] === col)
                        ? 'snake animated-snake'
                        : food[0] === row && food[1] === col
                        ? 'food animated-food'
                        : powerFood && powerFood[0] === row && powerFood[1] === col
                        ? 'power-food animated-power-food'
                        : badFood && badFood[0] === row && badFood[1] === col
                        ? 'bad-food animated-bad-food'
                        : ''
                    }`}
                  ></div>
                ))}
              </div>
            ))}
          </div>
          <div className="score fun-text">Score: {score}</div>
          <div className="level fun-text">Level: {level}</div>
          <div className="controls fun-buttons">
            <div>
              <button onClick={() => setDirection('LEFT')}>Up</button>
            </div>
            <div>
              <button onClick={() => setDirection('UP')}>Left</button>
              <button onClick={() => setDirection('DOWN')}>Right</button>
            </div>
            <div>
              <button onClick={() => setDirection('RIGHT')}>Down</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SnakeGame;
