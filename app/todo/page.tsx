'use client';

import { useState, useEffect } from 'react';

interface Todo {
  id: number;
  content: string;
  completed: boolean;
  createdAt: string;
}

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [isAnimating, setIsAnimating] = useState<number | null>(null);

  // Fetch todos from API
  const fetchTodos = async () => {
    try {
      const response = await fetch('/api/todos');
      if (!response.ok) {
        throw new Error('Failed to fetch todos');
      }
      const data = await response.json();
      setTodos(data);
      setError(null);
    } catch (err) {
      setError('Failed to load todos');
      console.error('Error fetching todos:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load todos on component mount
  useEffect(() => {
    fetchTodos();
  }, []);

  const addTodo = async () => {
    if (inputValue.trim()) {
      try {
        const response = await fetch('/api/todos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content: inputValue.trim() }),
        });

        if (!response.ok) {
          throw new Error('Failed to add todo');
        }

        const newTodo = await response.json();
        setTodos([...todos, newTodo]);
        setInputValue('');
        setError(null);
      } catch (err) {
        setError('Failed to add todo');
        console.error('Error adding todo:', err);
      }
    }
  };

  const toggleTodo = async (id: number) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: !todo.completed }),
      });

      if (!response.ok) {
        throw new Error('Failed to update todo');
      }

      const updatedTodo = await response.json();
      setTodos(todos.map(t => t.id === id ? updatedTodo : t));
      setError(null);
    } catch (err) {
      setError('Failed to update todo');
      console.error('Error updating todo:', err);
    }
  };

  const deleteTodo = async (id: number) => {
    // Add animation before deletion
    setIsAnimating(id);

    setTimeout(async () => {
      try {
        const response = await fetch(`/api/todos/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete todo');
        }

        setTodos(todos.filter(todo => todo.id !== id));
        setError(null);
      } catch (err) {
        setError('Failed to delete todo');
        console.error('Error deleting todo:', err);
      } finally {
        setIsAnimating(null);
      }
    }, 300);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTodo();
  };

  // Filter todos based on selected filter
  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  // Calculate statistics
  const activeCount = todos.filter(todo => !todo.completed).length;
  const completedCount = todos.filter(todo => todo.completed).length;

  const clearCompleted = async () => {
    const completedTodos = todos.filter(todo => todo.completed);

    try {
      // Delete all completed todos
      await Promise.all(
        completedTodos.map(todo =>
          fetch(`/api/todos/${todo.id}`, {
            method: 'DELETE',
          })
        )
      );

      // Update local state
      setTodos(todos.filter(todo => !todo.completed));
      setError(null);
    } catch (err) {
      setError('Failed to clear completed todos');
      console.error('Error clearing completed todos:', err);
    }
  };

  return (
    <div className="todo-container">
      <div className="todo-header">
        <h1 className="todo-title">✨ Todo Master</h1>
        <p className="todo-subtitle">
          Organize your tasks with style and ease
        </p>
      </div>

      {/* Error display */}
      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading your todos...</p>
        </div>
      )}

      {/* Add todo form */}
      <form onSubmit={handleSubmit} className="add-todo-form">
        <div className="input-container">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="What needs to be done today?"
            className="todo-input"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || loading}
            className="add-button"
          >
            <span className="add-icon">+</span>
            Add
          </button>
        </div>
      </form>

      {/* Filter tabs */}
      {!loading && todos.length > 0 && (
        <div className="filter-container">
          <button
            onClick={() => setFilter('all')}
            className={`filter-button ${filter === 'all' ? 'active' : ''}`}
          >
            All ({todos.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`filter-button ${filter === 'active' ? 'active' : ''}`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`filter-button ${filter === 'completed' ? 'active' : ''}`}
          >
            Completed ({completedCount})
          </button>
        </div>
      )}

      {/* Todo list */}
      {!loading && filteredTodos.length === 0 && todos.length > 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h3>No {filter === 'active' ? 'active' : filter === 'completed' ? 'completed' : ''} tasks</h3>
          <p>
            {filter === 'active' && "All caught up! Add a new task or view completed items."}
            {filter === 'completed' && "No completed tasks yet. Keep working on your goals!"}
            {filter === 'all' && "Start by adding your first task above!"}
          </p>
        </div>
      ) : !loading && todos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎯</div>
          <h3>Your todo list is empty</h3>
          <p>Add your first task to get started on your productive journey!</p>
        </div>
      ) : (
        <ul className="todo-list">
          {filteredTodos.map((todo, index) => (
            <li
              key={todo.id}
              className={`todo-item ${todo.completed ? 'completed' : ''} ${isAnimating === todo.id ? 'animating-out' : ''}`}
              style={{
                animation: isAnimating !== todo.id ? `slideIn 0.3s ease-out ${index * 0.05}s both` : undefined
              }}
            >
              <div className="todo-content">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id)}
                    disabled={isAnimating === todo.id}
                  />
                  <span className="checkmark"></span>
                </label>
                <span className="todo-text">
                  {todo.content}
                </span>
              </div>
              <div className="todo-actions">
                <span className="todo-date">
                  {new Date(todo.createdAt).toLocaleDateString()}
                </span>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  disabled={isAnimating === todo.id}
                  className="delete-button"
                >
                  <span className="delete-icon">🗑️</span>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Statistics and actions */}
      {todos.length > 0 && (
        <div className="todo-footer">
          <div className="stats">
            <div className="stat-item">
              <span className="stat-number">{activeCount}</span>
              <span className="stat-label">Active</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{completedCount}</span>
              <span className="stat-label">Completed</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{todos.length}</span>
              <span className="stat-label">Total</span>
            </div>
          </div>
          {completedCount > 0 && (
            <button
              onClick={clearCompleted}
              className="clear-completed-button"
            >
              Clear Completed ({completedCount})
            </button>
          )}
        </div>
      )}

      <style jsx>{`
        .todo-container {
          max-width: 700px;
          margin: 0 auto;
          padding: 2rem 1rem;
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .todo-header {
          text-align: center;
          margin-bottom: 2rem;
          color: white;
        }

        .todo-title {
          font-size: 3rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
          text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .todo-subtitle {
          font-size: 1.1rem;
          opacity: 0.9;
          margin: 0;
        }

        .error-message {
          background: linear-gradient(135deg, #ff6b6b, #ee5a6f);
          color: white;
          padding: 1rem;
          border-radius: 12px;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          box-shadow: 0 4px 12px rgba(238, 90, 111, 0.3);
        }

        .error-icon {
          font-size: 1.2rem;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          margin-bottom: 1.5rem;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-top: 4px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .loading-text {
          color: white;
          font-size: 1.1rem;
          margin: 0;
        }

        .add-todo-form {
          margin-bottom: 1.5rem;
        }

        .input-container {
          display: flex;
          gap: 0.75rem;
          background: white;
          border-radius: 16px;
          padding: 0.5rem;
          box-shadow: 0 8px 32px rgba(0,0,0,0.1);
        }

        .todo-input {
          flex: 1;
          padding: 1rem;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          background: #f8f9fa;
          transition: all 0.3s ease;
        }

        .todo-input:focus {
          outline: none;
          background: white;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .add-button {
          padding: 1rem 1.5rem;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .add-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
        }

        .add-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .add-icon {
          font-size: 1.2rem;
        }

        .filter-container {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          padding: 0.25rem;
        }

        .filter-button {
          flex: 1;
          padding: 0.75rem 1rem;
          background: transparent;
          color: rgba(255, 255, 255, 0.8);
          border: none;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .filter-button:hover {
          color: white;
          background: rgba(255, 255, 255, 0.1);
        }

        .filter-button.active {
          background: white;
          color: #667eea;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          color: white;
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .empty-state h3 {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
          font-weight: 600;
        }

        .empty-state p {
          opacity: 0.8;
          margin: 0;
          line-height: 1.6;
        }

        .todo-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .todo-item {
          background: white;
          border-radius: 12px;
          padding: 1rem;
          margin-bottom: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
        }

        .todo-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }

        .todo-item.animating-out {
          animation: slideOut 0.3s ease-out forwards;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideOut {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(20px);
          }
        }

        .todo-content {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex: 1;
        }

        .checkbox-container {
          position: relative;
          cursor: pointer;
        }

        .checkbox-container input {
          position: absolute;
          opacity: 0;
          cursor: pointer;
        }

        .checkmark {
          width: 24px;
          height: 24px;
          background: #f1f3f5;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          border: 2px solid #e9ecef;
        }

        .checkbox-container input:checked ~ .checkmark {
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-color: #667eea;
        }

        .checkbox-container input:checked ~ .checkmark::after {
          content: '✓';
          color: white;
          font-weight: bold;
          font-size: 14px;
        }

        .todo-text {
          flex: 1;
          font-size: 1rem;
          color: #333;
          transition: all 0.3s ease;
        }

        .todo-item.completed .todo-text {
          text-decoration: line-through;
          color: #868e96;
        }

        .todo-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .todo-date {
          font-size: 0.8rem;
          color: #868e96;
        }

        .delete-button {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: none;
          background: #ff6b6b;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .delete-button:hover {
          background: #ee5a6f;
          transform: scale(1.05);
        }

        .delete-icon {
          font-size: 1rem;
        }

        .todo-footer {
          margin-top: 2rem;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .stats {
          display: flex;
          gap: 2rem;
        }

        .stat-item {
          text-align: center;
          color: white;
        }

        .stat-number {
          display: block;
          font-size: 1.5rem;
          font-weight: bold;
        }

        .stat-label {
          font-size: 0.9rem;
          opacity: 0.8;
        }

        .clear-completed-button {
          padding: 0.75rem 1.5rem;
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 8px;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .clear-completed-button:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
        }

        @media (max-width: 640px) {
          .todo-container {
            padding: 1rem;
          }

          .todo-title {
            font-size: 2rem;
          }

          .input-container {
            flex-direction: column;
          }

          .add-button {
            justify-content: center;
          }

          .filter-container {
            flex-direction: column;
          }

          .todo-footer {
            flex-direction: column;
          }

          .stats {
            width: 100%;
            justify-content: space-around;
          }

          .todo-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.75rem;
          }

          .todo-actions {
            width: 100%;
            justify-content: space-between;
          }
        }
      `}</style>
    </div>
  );
}