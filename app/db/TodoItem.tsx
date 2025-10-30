'use client';

import { useState } from 'react';

interface TodoItemProps {
  id: number;
  content: string;
  completed: boolean;
  onToggle: (id: number, completed: boolean) => void;
  onDelete: (id: number) => void;
  onEdit: (id: number, content: string) => void;
}

export default function TodoItem({ id, content, completed, onToggle, onDelete, onEdit }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);

  const handleEdit = () => {
    if (isEditing && editContent.trim() !== content) {
      onEdit(id, editContent.trim());
    }
    setIsEditing(!isEditing);
  };

  const handleCancel = () => {
    setEditContent(content);
    setIsEditing(false);
  };

  return (
    <li
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '15px',
        margin: '10px 0',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        border: '1px solid #e0e0e0'
      }}
    >
      <button
        onClick={() => onToggle(id, completed)}
        style={{
          padding: '5px 10px',
          backgroundColor: completed ? '#28a745' : '#6c757d',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontSize: '12px',
          cursor: 'pointer',
          marginRight: '10px'
        }}
      >
        {completed ? 'Completed' : 'Mark Complete'}
      </button>

      {isEditing ? (
        <div style={{ display: 'flex', alignItems: 'center', flex: 1, gap: '10px' }}>
          <input
            type="text"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleEdit()}
            style={{
              flex: 1,
              padding: '5px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '16px'
            }}
            autoFocus
          />
          <button
            onClick={handleEdit}
            style={{
              padding: '5px 10px',
              backgroundColor: '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Save
          </button>
          <button
            onClick={handleCancel}
            style={{
              padding: '5px 10px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      ) : (
        <>
          <span
            style={{
              flex: 1,
              textDecoration: completed ? 'line-through' : 'none',
              color: completed ? '#666' : '#333',
              fontSize: '16px'
            }}
          >
            {content}
          </span>
          <button
            onClick={handleEdit}
            style={{
              padding: '5px 10px',
              backgroundColor: '#ffc107',
              color: '#212529',
              border: 'none',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(id)}
            style={{
              padding: '5px 10px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Delete
          </button>
        </>
      )}
    </li>
  );
}