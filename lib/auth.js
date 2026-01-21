import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { getSupabaseAdmin } from '@/lib/supabaseServer';

const usersFilePath = path.join(process.cwd(), 'data', 'users.json');
const sessionsFilePath = path.join(process.cwd(), 'data', 'sessions.json');

async function readJSON(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

async function writeJSON(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

function mapUserRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    passwordHash: row.password_hash,
    isGuest: row.is_guest,
    passwordResetOtpHash: row.password_reset_otp_hash,
    passwordResetOtpExpiresAt: row.password_reset_otp_expires_at ? new Date(row.password_reset_otp_expires_at).getTime() : null,
    passwordResetOtpAttempts: row.password_reset_otp_attempts,
    passwordResetOtpLastSentAt: row.password_reset_otp_last_sent_at ? new Date(row.password_reset_otp_last_sent_at).getTime() : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapSessionRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    createdAt: row.created_at,
    expiresAt: new Date(row.expires_at).getTime(),
  };
}

export async function getUsers() {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data, error } = await supabase
      .from('users')
      .select('id,email,name,password_hash,is_guest,password_reset_otp_hash,password_reset_otp_expires_at,password_reset_otp_attempts,password_reset_otp_last_sent_at,created_at,updated_at');
    if (error) throw error;
    return (data || []).map(mapUserRow);
  }

  const data = await readJSON(usersFilePath);
  return data ? data.users : [];
}

export async function getUserById(id) {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data, error } = await supabase
      .from('users')
      .select('id,email,name,password_hash,is_guest,created_at,updated_at')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return mapUserRow(data);
  }

  const users = await getUsers();
  return users.find(u => u.id === id) || null;
}

export async function getUserByEmail(email) {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data, error } = await supabase
      .from('users')
      .select('id,email,name,password_hash,is_guest,created_at,updated_at')
      .eq('email', email)
      .maybeSingle();
    if (error) throw error;
    return mapUserRow(data);
  }

  const users = await getUsers();
  return users.find(u => u.email === email) || null;
}

export async function createOAuthUser({ email, name = null }) {
  const randomPassword = crypto.randomBytes(32).toString('hex');
  return await createUser({ email, password: randomPassword, name, isGuest: false });
}

async function saveUsers(users) {
  const data = (await readJSON(usersFilePath)) || { version: 1 };
  data.users = users;
  data.updatedAt = new Date().toISOString();
  await writeJSON(usersFilePath, data);
}

export async function createUser({ email, password, name = null, isGuest = false }) {
  const supabase = getSupabaseAdmin();
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);
  const id = crypto.randomUUID();

  if (supabase) {
    const { data, error } = await supabase
      .from('users')
      .insert({ id, email, name, password_hash: passwordHash, is_guest: isGuest })
      .select('id,email,name,password_hash,is_guest,created_at,updated_at')
      .single();

    if (error) {
      if (error.code === '23505') throw new Error('Email already exists');
      throw error;
    }

    return mapUserRow(data);
  }

  const users = await getUsers();
  if (!isGuest && users.some(u => u.email === email)) {
    throw new Error('Email already exists');
  }

  const newUser = {
    id,
    email,
    name,
    passwordHash,
    isGuest,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  users.push(newUser);
  await saveUsers(users);
  return newUser;
}

export async function updateUser(id, updates) {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    if (updates.email) {
      const { data: existing, error: existingError } = await supabase
        .from('users')
        .select('id')
        .eq('email', updates.email)
        .neq('id', id)
        .maybeSingle();
      if (existingError) throw existingError;
      if (existing) throw new Error('Email already exists');
    }

    const updatePayload = {};
    if (typeof updates.name !== 'undefined') updatePayload.name = updates.name;
    if (typeof updates.email !== 'undefined') updatePayload.email = updates.email;

    if (updates.password) {
      const salt = await bcrypt.genSalt(12);
      updatePayload.password_hash = await bcrypt.hash(updates.password, salt);
    }

    const { data, error } = await supabase
      .from('users')
      .update(updatePayload)
      .eq('id', id)
      .select('id,email,name,password_hash,is_guest,created_at,updated_at')
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new Error('User not found');
    return mapUserRow(data);
  }

  const users = await getUsers();
  const index = users.findIndex(u => u.id === id);
  if (index === -1) throw new Error('User not found');

  if (updates.email && updates.email !== users[index].email) {
    if (users.some(u => u.email === updates.email && u.id !== id)) {
      throw new Error('Email already exists');
    }
  }

  if (updates.password) {
    const salt = await bcrypt.genSalt(12);
    updates.passwordHash = await bcrypt.hash(updates.password, salt);
    delete updates.password;
  }

  users[index] = { ...users[index], ...updates, updatedAt: new Date().toISOString() };
  await saveUsers(users);
  return users[index];
}

function generateOtp() {
  return (Math.floor(100000 + Math.random() * 900000)).toString();
}

export async function createPasswordResetOtp(email) {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data: user, error } = await supabase
      .from('users')
      .select('id,password_reset_otp_last_sent_at')
      .eq('email', email)
      .maybeSingle();
    if (error) throw error;
    if (!user) return null;

    const now = Date.now();
    const lastSentAt = user.password_reset_otp_last_sent_at ? new Date(user.password_reset_otp_last_sent_at).getTime() : 0;
    if (now - lastSentAt < 60_000) {
      throw new Error('Please wait before requesting another OTP');
    }

    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, await bcrypt.genSalt(12));
    const expiresAt = new Date(now + 10 * 60_000).toISOString();

    const { error: updateError } = await supabase
      .from('users')
      .update({
        password_reset_otp_hash: otpHash,
        password_reset_otp_expires_at: expiresAt,
        password_reset_otp_attempts: 0,
        password_reset_otp_last_sent_at: new Date(now).toISOString(),
      })
      .eq('id', user.id);
    if (updateError) throw updateError;
    return otp;
  }

  const users = await getUsers();
  const index = users.findIndex(u => u.email === email);
  if (index === -1) return null;

  const now = Date.now();
  const lastSentAt = users[index].passwordResetOtpLastSentAt || 0;
  if (now - lastSentAt < 60_000) {
    throw new Error('Please wait before requesting another OTP');
  }

  const otp = generateOtp();
  const otpHash = await bcrypt.hash(otp, await bcrypt.genSalt(12));

  users[index].passwordResetOtpHash = otpHash;
  users[index].passwordResetOtpExpiresAt = now + 10 * 60_000;
  users[index].passwordResetOtpAttempts = 0;
  users[index].passwordResetOtpLastSentAt = now;
  users[index].updatedAt = new Date().toISOString();

  await saveUsers(users);
  return otp;
}

export async function resetPasswordWithOtp(email, otp, newPassword) {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data: user, error } = await supabase
      .from('users')
      .select('id,password_hash,password_reset_otp_hash,password_reset_otp_expires_at,password_reset_otp_attempts')
      .eq('email', email)
      .maybeSingle();
    if (error) throw error;
    if (!user) throw new Error('Invalid OTP');

    const expiresAt = user.password_reset_otp_expires_at ? new Date(user.password_reset_otp_expires_at).getTime() : 0;
    const attempts = user.password_reset_otp_attempts || 0;
    if (!user.password_reset_otp_hash || Date.now() > expiresAt) {
      throw new Error('Invalid or expired OTP');
    }
    if (attempts >= 5) {
      throw new Error('Too many attempts. Please request a new OTP');
    }

    const ok = await bcrypt.compare(otp, user.password_reset_otp_hash);
    if (!ok) {
      const { error: attemptError } = await supabase
        .from('users')
        .update({ password_reset_otp_attempts: attempts + 1 })
        .eq('id', user.id);
      if (attemptError) throw attemptError;
      throw new Error('Invalid or expired OTP');
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(newPassword, salt);
    const { error: updateError } = await supabase
      .from('users')
      .update({
        password_hash: passwordHash,
        password_reset_otp_hash: null,
        password_reset_otp_expires_at: null,
        password_reset_otp_attempts: null,
        password_reset_otp_last_sent_at: null,
      })
      .eq('id', user.id);
    if (updateError) throw updateError;
    return await getUserById(user.id);
  }

  const users = await getUsers();
  const index = users.findIndex(u => u.email === email);
  if (index === -1) throw new Error('Invalid OTP');

  const user = users[index];
  const expiresAt = user.passwordResetOtpExpiresAt || 0;
  const attempts = user.passwordResetOtpAttempts || 0;

  if (!user.passwordResetOtpHash || Date.now() > expiresAt) {
    throw new Error('Invalid or expired OTP');
  }

  if (attempts >= 5) {
    throw new Error('Too many attempts. Please request a new OTP');
  }

  const ok = await bcrypt.compare(otp, user.passwordResetOtpHash);
  if (!ok) {
    users[index].passwordResetOtpAttempts = attempts + 1;
    await saveUsers(users);
    throw new Error('Invalid or expired OTP');
  }

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(newPassword, salt);

  users[index].passwordHash = passwordHash;
  users[index].passwordResetOtpHash = null;
  users[index].passwordResetOtpExpiresAt = null;
  users[index].passwordResetOtpAttempts = null;
  users[index].updatedAt = new Date().toISOString();

  await saveUsers(users);
  return users[index];
}

export async function authenticateUser(email, password) {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data, error } = await supabase
      .from('users')
      .select('id,email,name,password_hash,is_guest,created_at,updated_at')
      .eq('email', email)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    const user = mapUserRow(data);
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) return null;
    return user;
  }

  const users = await getUsers();
  const user = users.find(u => u.email === email);
  if (!user) return null;
  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) return null;
  return user;
}

export async function getSessions() {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data, error } = await supabase
      .from('sessions')
      .select('id,user_id,created_at,expires_at');
    if (error) throw error;
    return (data || []).map(mapSessionRow);
  }

  const data = await readJSON(sessionsFilePath);
  return data ? data.sessions : [];
}

async function saveSessions(sessions) {
  const data = (await readJSON(sessionsFilePath)) || { version: 1 };
  data.sessions = sessions;
  await writeJSON(sessionsFilePath, data);
}

export async function createSession(userId) {
  const supabase = getSupabaseAdmin();
  const id = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

  if (supabase) {
    const { data, error } = await supabase
      .from('sessions')
      .insert({ id, user_id: userId, expires_at: expiresAt.toISOString() })
      .select('id,user_id,created_at,expires_at')
      .single();
    if (error) throw error;
    return mapSessionRow(data);
  }

  const sessions = await getSessions();
  const session = {
    id,
    userId,
    createdAt: new Date().toISOString(),
    expiresAt: expiresAt.getTime(),
  };
  sessions.push(session);
  await saveSessions(sessions);
  return session;
}

export async function getSession(sessionId) {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data, error } = await supabase
      .from('sessions')
      .select('id,user_id,created_at,expires_at')
      .eq('id', sessionId)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    const session = mapSessionRow(data);
    if (Date.now() > session.expiresAt) {
      await deleteSession(sessionId);
      return null;
    }
    return session;
  }

  const sessions = await getSessions();
  const session = sessions.find(s => s.id === sessionId);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    await deleteSession(sessionId);
    return null;
  }
  return session;
}

export async function deleteSession(sessionId) {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { error } = await supabase.from('sessions').delete().eq('id', sessionId);
    if (error) throw error;
    return;
  }

  const sessions = await getSessions();
  const filtered = sessions.filter(s => s.id !== sessionId);
  await saveSessions(filtered);
}
