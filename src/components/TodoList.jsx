import React, { useState, useEffect } from 'react';

const Modal = ({ message, onClose }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-content" onClick={e => e.stopPropagation()}>
      <p>{message}</p>
      <button onClick={onClose}>Close</button>
    </div>
  </div>
);

const COOKIE_NAME = 'todos';

// Helper: read todos from cookies
const getTodosFromCookie = () => {
  const cookie = document.cookie
    .split('; ')
    .find(row => row.startsWith(`${COOKIE_NAME}=`));
  if (!cookie) return [];
  try {
    return JSON.parse(decodeURIComponent(cookie.split('=')[1]));
  } catch {
    return [];
  }
};

// Helper: write todos to cookie
const setTodosToCookie = (todos) => {
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(todos))}; path=/; max-age=${60 * 60 * 24 * 365}`;
};

const TodoList = () => {
  const [todos, setTodos] = useState(getTodosFromCookie);
  const [input, setInput] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    setTodosToCookie(todos);
  }, [todos]);

  const addTodo = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setTodos(prev => [...prev, { text: trimmed, done: false }]);
    setInput('');
  };

  const toggleDone = index => {
    setTodos(prev =>
      prev.map((todo, i) =>
        i === index ? { ...todo, done: !todo.done } : todo
      )
    );
  };

  const deleteTodo = index => {
    setTodos(prev => prev.filter((_, i) => i !== index));
  };

  const editTodo = (index, newText) => {
    setTodos(prev =>
      prev.map((todo, i) =>
        i === index ? { ...todo, text: newText } : todo
      )
    );
  };

  const finishDay = () => {
    if (todos.length === 0) {
      setModalMessage("You didn't add anything today — that's okay! Rest is important too.");
    } else if (todos.every(todo => todo.done)) {
      setModalMessage("🎉 Great job! You finished everything today. Take a break, you earned it!");
    } else {
      setModalMessage("Not everything got done, and that’s okay. You’re still making progress. Be kind to yourself 💜");
    }
    setModalOpen(true);
  };

  return (
    <>
      <div className="todo-container">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addTodo()}
          placeholder="Add a task..."
          onFocus={e => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' })}
        />
        <button onClick={addTodo}>Add</button>

        <ul className="todo-list">
          {todos.map((todo, index) => (
            <li
              key={index}
              className="todo-item"
              style={{ opacity: todo.done ? 0.3 : 1 }}
            >
              <input
                type="text"
                value={todo.text}
                onChange={e => editTodo(index, e.target.value)}
                className="todo-edit-input"
              />
              <button onClick={() => toggleDone(index)}>
                {todo.done ? 'Undo' : 'Done'}
              </button>
              <button onClick={() => deleteTodo(index)}>Delete</button>
            </li>
          ))}
        </ul>

        <button className="finish-day-btn" onClick={finishDay}>Finish Off Day</button>
      </div>

      {modalOpen && <Modal message={modalMessage} onClose={() => setModalOpen(false)} />}
    </>
  );
};

export default TodoList;
