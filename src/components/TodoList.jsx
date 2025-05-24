import React, { useState, useEffect } from 'react';

const Modal = ({ message, onClose }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-content" onClick={e => e.stopPropagation()}>
      <p>{message}</p>
      <button onClick={onClose}>Close</button>
    </div>
  </div>
);

const TodoList = () => {
  // Load todos from cookie or start with empty list
  const [todos, setTodos] = useState(() => {
    const saved = document.cookie.split('; ').find(row => row.startsWith('todos='));
    return saved ? JSON.parse(decodeURIComponent(saved.split('=')[1])) : [];
  });

  const [input, setInput] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  // Save todos to cookie whenever they change
  useEffect(() => {
    document.cookie = `todos=${encodeURIComponent(JSON.stringify(todos))}; path=/`;
  }, [todos]);

  // Add a new todo if input is non-empty
  const addTodo = () => {
    if (input.trim()) {
      setTodos([...todos, { text: input.trim(), done: false }]);
      setInput('');
    }
  };

  // Toggle done status for a todo item
  const toggleDone = (index) => {
    const updated = [...todos];
    updated[index].done = !updated[index].done;
    setTodos(updated);
  };

  // Delete a todo item by index
  const deleteTodo = (index) => {
    const updated = [...todos];
    updated.splice(index, 1);
    setTodos(updated);
  };

  // Edit the text of a todo item
  const editTodo = (index, newText) => {
    const updated = [...todos];
    updated[index].text = newText;
    setTodos(updated);
  };

  // Show a modal message based on todo completion status
  const finishDay = () => {
    const allDone = todos.length > 0 && todos.every(todo => todo.done);
    if (todos.length === 0) {
      setModalMessage("You didn't add anything today — that's okay! Rest is important too.");
    } else if (allDone) {
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
                onChange={(e) => editTodo(index, e.target.value)}
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
