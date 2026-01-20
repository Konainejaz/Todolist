import { promises as fs } from 'fs';
import path from 'path';
import { getSession } from '@/lib/auth';
import { cookies } from 'next/headers';

const dataFilePath = path.join(process.cwd(), 'data', 'todos.json');

async function getTodos() {
  try {
    const data = await fs.readFile(dataFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function saveTodos(todos) {
  await fs.writeFile(dataFilePath, JSON.stringify(todos, null, 2));
}

async function getCurrentUserId() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('session_id')?.value;
  if (!sessionId) return null;
  const session = await getSession(sessionId);
  return session ? session.userId : null;
}

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const todos = await getTodos();
  const userTodos = todos.filter(t => t.userId === userId);
  return Response.json(userTodos);
}

export async function POST(request) {
  const userId = await getCurrentUserId();
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const todo = await request.json();
  const todos = await getTodos();
  const newTodo = { 
    ...todo, 
    id: crypto.randomUUID(), 
    userId, // Associate with user
    createdAt: new Date().toISOString() 
  };
  todos.unshift(newTodo);
  await saveTodos(todos);
  return Response.json(newTodo);
}

export async function PUT(request) {
  const userId = await getCurrentUserId();
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const updatedTodo = await request.json();
  const todos = await getTodos();
  const index = todos.findIndex((t) => t.id === updatedTodo.id && t.userId === userId);
  
  if (index !== -1) {
    todos[index] = { ...todos[index], ...updatedTodo, userId }; // Ensure userId stays same
    await saveTodos(todos);
    return Response.json(todos[index]);
  }
  
  return Response.json({ error: 'Todo not found or unauthorized' }, { status: 404 });
}

export async function DELETE(request) {
  const userId = await getCurrentUserId();
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  const todos = await getTodos();
  const filteredTodos = todos.filter((t) => !(t.id === id && t.userId === userId));
  await saveTodos(filteredTodos);
  
  return Response.json({ success: true });
}
