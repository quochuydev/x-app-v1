import { db, todos, TodoList, TodoForm } from '@/app/db';

export const dynamic = 'force-dynamic';

export default async function Home() {
  let todoList = [];

  try {
    todoList = await db.select().from(todos).orderBy(todos.createdAt);
  } catch (error) {
    console.error('Database connection failed:', error);
    // Continue with empty todo list for build time
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center', color: '#333', marginBottom: '30px' }}>Todo List</h1>

      <TodoForm />

      <TodoList todos={todoList} />

      {todoList.length === 0 && (
        <div style={{ textAlign: 'center', color: '#666', fontStyle: 'italic', marginTop: '30px' }}>
          No todos yet. Add one above to get started!
          <br />
          <small>If the todo functionality is not working, please ensure the database is configured.</small>
        </div>
      )}
    </div>
  );
}
