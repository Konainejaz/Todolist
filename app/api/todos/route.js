import { promises as fs } from 'fs';
import path from 'path';

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

export async function GET() {
  const todos = await getTodos();
  return Response.json(todos);
}

export async function POST(request) {
  const todo = await request.json();
  const todos = await getTodos();
  const newTodo = { ...todo, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  todos.unshift(newTodo);
  await saveTodos(todos);
  return Response.json(newTodo);
}

export async function PUT(request) {
  const updatedTodo = await request.json();
  const todos = await getTodos();
  const index = todos.findIndex((t) => t.id === updatedTodo.id);
  
  if (index !== -1) {
    todos[index] = { ...todos[index], ...updatedTodo };
    await saveTodos(todos);
    return Response.json(todos[index]);
  }
  
  return Response.json({ error: 'Todo not found' }, { status: 404 });
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  const todos = await getTodos();
  const filteredTodos = todos.filter((t) => t.id !== id);
  await saveTodos(filteredTodos);
  
  return Response.json({ success: true });
}
