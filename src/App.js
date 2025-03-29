import React from 'react';
import SnakeGame from './SnakeGame';
import './SnakeGame.css';

function App() {
  return (
    <div className="App">
      <div className="game-container">
        <h1>Snake Game</h1>
        <SnakeGame />
      </div>
    </div>
  );
}

export default App;