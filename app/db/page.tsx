import { addTodoAction, deleteTodoAction } from './actions';
import { InferSelectModel } from 'drizzle-orm';
import { todos } from './schema';

type Todo = InferSelectModel<typeof todos>;

export const dynamic = 'force-dynamic';

export default async function Home() {
  let todoList: Todo[] = [];

  try {
    if (process.env.DATABASE_URL) {
      const { db } = await import('./drizzle');
      const { todos } = await import('./schema');
      todoList = await db.select().from(todos).orderBy(todos.createdAt);
    }
  } catch (error) {
    console.error('Error fetching todos:', error);
  }

  return (
    <div>
      <h1>Todo List</h1>
      {!process.env.DATABASE_URL && (
        <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: '4px' }}>
          <strong>Database not configured</strong>. Set DATABASE_URL environment variable to use database features.
        </div>
      )}
      <form action={addTodoAction}>
        <input type="text" name="content" required />
        <button type="submit">Add Todo</button>
      </form>
      <ul>
        {todoList.map((todo) => (
          <li key={todo.id}>
            <span style={{ marginRight: '10px' }}>{todo.content}</span>
            <form action={deleteTodoAction} style={{ display: 'inline' }}>
              <input type="hidden" value={todo.id} name="id" />
              <button type="submit">Delete</button>
            </form>
          </li>
        ))}
      </ul>
      {todoList.length === 0 && process.env.DATABASE_URL && (
        <p>No todos yet. Add one above!</p>
      )}
    </div>
  );
}
