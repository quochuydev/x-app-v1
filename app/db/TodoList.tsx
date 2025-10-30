'use client';

import { useState, useTransition } from 'react';
import TodoItem from './TodoItem';
import { toggleTodoAction, editTodoAction, deleteTodoAction } from './actions';

interface Todo {
  id: number;
  content: string;
  completed: boolean | null;
  createdAt: Date;
}

interface TodoListProps {
  todos: Todo[];
}

export default function TodoList({ todos }: TodoListProps) {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const showMessage = (msg: string, isError = false) => {
    if (isError) {
      setError(msg);
      setTimeout(() => setError(''), 3000);
    } else {
      setMessage(msg);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleToggle = (id: number, completed: boolean) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append('id', id.toString());
      formData.append('completed', completed.toString());
      const result = await toggleTodoAction(formData);

      if (result?.success) {
        showMessage(result.message);
      } else {
        showMessage(result?.message || 'Failed to toggle todo', true);
      }
    });
  };

  const handleEdit = (id: number, content: string) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append('id', id.toString());
      formData.append('content', content);
      const result = await editTodoAction(formData);

      if (result?.success) {
        showMessage(result.message);
      } else {
        showMessage(result?.message || 'Failed to edit todo', true);
      }
    });
  };

  const handleDelete = (id: number) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append('id', id.toString());
      const result = await deleteTodoAction(formData);

      if (result?.success) {
        showMessage(result.message);
      } else {
        showMessage(result?.message || 'Failed to delete todo', true);
      }
    });
  };

  return (
    <div>
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

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            id={todo.id}
            content={todo.content}
            completed={todo.completed || false}
            onToggle={handleToggle}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </ul>
    </div>
  );
}