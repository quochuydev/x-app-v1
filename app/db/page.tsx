import { addTodoAction, deleteTodoAction, toggleTodoAction } from './actions';
import { db } from './drizzle';
import { todos } from './schema';

export const dynamic = 'force-dynamic';

export default async function Home() {
  let todoList = await db.select().from(todos).orderBy(todos.createdAt);

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Todo List</h1>

      <form action={addTodoAction} style={{ marginBottom: '30px', display: 'flex', gap: '10px' }}>
        <input
          type="text"
          name="content"
          required
          placeholder="Add a new todo..."
          style={{
            flex: 1,
            padding: '10px',
            border: '2px solid #ddd',
            borderRadius: '5px',
            fontSize: '16px'
          }}
        />
        <button
          type="submit"
          style={{
            padding: '10px 20px',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Add Todo
        </button>
      </form>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {todoList.map((todo) => (
          <li
            key={todo.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px',
              marginBottom: '10px',
              backgroundColor: '#f9f9f9',
              borderRadius: '8px',
              border: '1px solid #eee'
            }}
          >
            <form action={toggleTodoAction} style={{ marginRight: '12px' }}>
              <input type="hidden" value={todo.id} name="id" />
              <input type="hidden" value={(!todo.completed).toString()} name="completed" />
              <input
                type="checkbox"
                checked={todo.completed || false}
                onChange={() => {}}
                style={{
                  width: '18px',
                  height: '18px',
                  cursor: 'pointer'
                }}
              />
            </form>

            <span
              style={{
                marginRight: 'auto',
                textDecoration: todo.completed ? 'line-through' : 'none',
                color: todo.completed ? '#666' : '#000',
                fontSize: '16px'
              }}
            >
              {todo.content}
            </span>

            <form action={deleteTodoAction} style={{ display: 'inline' }}>
              <input type="hidden" value={todo.id} name="id" />
              <button
                type="submit"
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#ff4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Delete
              </button>
            </form>
          </li>
        ))}
      </ul>

      {todoList.length === 0 && (
        <p style={{ textAlign: 'center', color: '#666', marginTop: '30px' }}>
          No todos yet. Add one above!
        </p>
      )}
    </div>
  );
}
