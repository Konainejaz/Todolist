import { promises as fs } from 'fs';
import path from 'path';
import { getSession } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';
import crypto from 'crypto';

const dataFilePath = path.join(process.cwd(), 'data', 'todos.json');

export const runtime = 'nodejs';

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

function mapTodoRow(row) {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description,
    dueDate: row.due_date,
    priority: row.priority,
    completed: row.completed,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
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

  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data, error } = await supabase
      .from('todos')
      .select('id,user_id,title,description,due_date,priority,completed,created_at,updated_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) return Response.json({ error: 'Failed to load todos' }, { status: 500 });
    return Response.json((data || []).map(mapTodoRow));
  }

  const todos = await getTodos();
  const userTodos = todos.filter(t => t.userId === userId);
  return Response.json(userTodos);
}

export async function POST(request) {
  const userId = await getCurrentUserId();
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const todo = await request.json();

  const supabase = getSupabaseAdmin();
  if (supabase) {
    const id = crypto.randomUUID();
    const payload = {
      id,
      user_id: userId,
      title: todo.title,
      description: todo.description || null,
      due_date: todo.dueDate ? new Date(todo.dueDate).toISOString() : null,
      priority: todo.priority || 'medium',
      completed: !!todo.completed,
    };
    const { data, error } = await supabase
      .from('todos')
      .insert(payload)
      .select('id,user_id,title,description,due_date,priority,completed,created_at,updated_at')
      .single();
    if (error) return Response.json({ error: 'Failed to create todo' }, { status: 500 });
    return Response.json(mapTodoRow(data));
  }

  const todos = await getTodos();
  const newTodo = {
    ...todo,
    id: crypto.randomUUID(),
    userId,
    createdAt: new Date().toISOString(),
  };
  todos.unshift(newTodo);
  await saveTodos(todos);
  return Response.json(newTodo);
}

export async function PUT(request) {
  const userId = await getCurrentUserId();
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const updatedTodo = await request.json();

  const supabase = getSupabaseAdmin();
  if (supabase) {
    const updatePayload = {
      title: updatedTodo.title,
      description: updatedTodo.description || null,
      due_date: updatedTodo.dueDate ? new Date(updatedTodo.dueDate).toISOString() : null,
      priority: updatedTodo.priority || 'medium',
      completed: !!updatedTodo.completed,
    };
    const { data, error } = await supabase
      .from('todos')
      .update(updatePayload)
      .eq('id', updatedTodo.id)
      .eq('user_id', userId)
      .select('id,user_id,title,description,due_date,priority,completed,created_at,updated_at')
      .maybeSingle();
    if (error) return Response.json({ error: 'Failed to update todo' }, { status: 500 });
    if (!data) return Response.json({ error: 'Todo not found or unauthorized' }, { status: 404 });
    return Response.json(mapTodoRow(data));
  }

  const todos = await getTodos();
  const index = todos.findIndex((t) => t.id === updatedTodo.id && t.userId === userId);
  if (index !== -1) {
    todos[index] = { ...todos[index], ...updatedTodo, userId };
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

  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { error } = await supabase.from('todos').delete().eq('id', id).eq('user_id', userId);
    if (error) return Response.json({ error: 'Failed to delete todo' }, { status: 500 });
    return Response.json({ success: true });
  }

  const todos = await getTodos();
  const filteredTodos = todos.filter((t) => !(t.id === id && t.userId === userId));
  await saveTodos(filteredTodos);
  return Response.json({ success: true });
}
