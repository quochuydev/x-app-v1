'use client';

import { useState, useTransition } from 'react';
import { addTodoAction } from './actions';

export default function TodoForm() {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!content.trim()) {
      setError('Please enter a todo item');
      return;
    }

    if (content.length > 255) {
      setError('Todo must be less than 255 characters');
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append('content', content);

      const result = await addTodoAction(formData);

      if (result?.success) {
        setContent('');
        setMessage(result.message);
        setTimeout(() => setMessage(''), 3000);
      } else {
        setError(result?.message || 'Failed to add todo');
      }
    });
  };

  return (
    <div>
      <form onSubmit={handleSubmit} style={{ marginBottom: '30px', display: 'flex', gap: '10px' }}>
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add a new todo..."
          disabled={isPending}
          style={{
            flex: 1,
            padding: '10px',
            border: '2px solid #ddd',
            borderRadius: '5px',
            fontSize: '16px',
            opacity: isPending ? 0.7 : 1
          }}
        />
        <button
          type="submit"
          disabled={isPending}
          style={{
            padding: '10px 20px',
            backgroundColor: isPending ? '#ccc' : '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            fontSize: '16px',
            cursor: isPending ? 'not-allowed' : 'pointer'
          }}
        >
          {isPending ? 'Adding...' : 'Add Todo'}
        </button>
      </form>

      {error && (
        <div style={{
          padding: '10px',
          marginBottom: '20px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb',
          borderRadius: '4px'
        }}>
          {error}
        </div>
      )}

      {message && (
        <div style={{
          padding: '10px',
          marginBottom: '20px',
          backgroundColor: '#d4edda',
          color: '#155724',
          border: '1px solid #c3e6cb',
          borderRadius: '4px'
        }}>
          {message}
        </div>
      )}
    </div>
  );
}