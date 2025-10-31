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

  const API_BASE = '/api/todos';

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_BASE);
      if (!response.ok) {
        throw new Error('Failed to fetch todos');
      }
      const data = await response.json();
      setTodos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async () => {
    if (inputValue.trim()) {
      try {
        const response = await fetch(API_BASE, {
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
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to add todo');
      }
    }
  };

  const toggleTodo = async (id: number) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    try {
      const response = await fetch(`${API_BASE}/${id}`, {
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update todo');
    }
  };

  const deleteTodo = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete todo');
      }

      setTodos(todos.filter(todo => todo.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete todo');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTodo();
  };

  const clearCompleted = async () => {
    const completedTodos = todos.filter(todo => todo.completed);

    try {
      await Promise.all(
        completedTodos.map(todo =>
          fetch(`${API_BASE}/${todo.id}`, { method: 'DELETE' })
        )
      );
      setTodos(todos.filter(todo => !todo.completed));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear completed todos');
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h1>Simple Todo App</h1>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        A todo app with database persistence and API integration
      </p>

      {error && (
        <div style={{
          backgroundColor: '#fee',
          color: '#c00',
          padding: '10px',
          borderRadius: '4px',
          marginBottom: '20px',
        }}>
          Error: {error}
          <button
            onClick={() => setError(null)}
            style={{
              float: 'right',
              background: 'none',
              border: 'none',
              color: '#c00',
              cursor: 'pointer',
              fontSize: '16px',
            }}
          >
            ×
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="What needs to be done?"
            disabled={loading}
            style={{
              flex: 1,
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px',
              opacity: loading ? 0.6 : 1,
            }}
          />
          <button
            type="submit"
            disabled={loading || !inputValue.trim()}
            style={{
              padding: '10px 20px',
              backgroundColor: '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              cursor: (loading || !inputValue.trim()) ? 'not-allowed' : 'pointer',
              opacity: (loading || !inputValue.trim()) ? 0.6 : 1,
            }}
          >
            {loading ? 'Loading...' : 'Add Todo'}
          </button>
        </div>
      </form>

      {loading ? (
        <p style={{ textAlign: 'center', color: '#999' }}>Loading todos...</p>
      ) : todos.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#999' }}>No todos yet. Add one above!</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {todos.map((todo) => (
            <li
              key={todo.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '10px',
                borderBottom: '1px solid #eee',
                gap: '10px',
              }}
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
                disabled={loading}
                style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
              />
              <span
                style={{
                  flex: 1,
                  textDecoration: todo.completed ? 'line-through' : 'none',
                  color: todo.completed ? '#999' : '#333',
                }}
              >
                {todo.content}
              </span>
              <button
                onClick={() => deleteTodo(todo.id)}
                disabled={loading}
                style={{
                  padding: '5px 10px',
                  backgroundColor: '#ff4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '12px',
                  opacity: loading ? 0.6 : 1,
                }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}

      {todos.length > 0 && (
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <p style={{ color: '#666' }}>
            {todos.filter(todo => !todo.completed).length} of {todos.length} tasks remaining
          </p>
          {todos.some(todo => todo.completed) && (
            <button
              onClick={clearCompleted}
              disabled={loading}
              style={{
                padding: '8px 16px',
                backgroundColor: '#666',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                opacity: loading ? 0.6 : 1,
              }}
            >
              Clear Completed
            </button>
          )}
        </div>
      )}
    </div>
  );
}