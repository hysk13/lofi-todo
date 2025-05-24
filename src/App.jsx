import React from 'react';
import TodoList from './components/TodoList';
import MusicPlayer from './components/MusicPlayer';
import Background from './components/Background';

const App = () => (
  <div>
    <Background />
    <div className="main-layout">
      <div className="pane left">
        <div className="todo-card">
          <h1>What Do I Need To Do?</h1>
          <TodoList />
        </div>
      </div>
      <div className="pane right">
        <div className="music-card">
          <MusicPlayer />
        </div>
      </div>
    </div>
  </div>
);

export default App;