import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const usersFilePath = path.join(process.cwd(), 'data', 'users.json');
const sessionsFilePath = path.join(process.cwd(), 'data', 'sessions.json');

// --- Helper Functions ---

async function readJSON(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null; 
    }
    throw error;
  }
}

async function writeJSON(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

// --- User Management ---

export async function getUsers() {
  const data = await readJSON(usersFilePath);
  return data ? data.users : [];
}

async function saveUsers(users) {
  const data = await readJSON(usersFilePath) || { version: 1 };
  data.users = users;
  data.updatedAt = new Date().toISOString();
  await writeJSON(usersFilePath, data);
}

export async function createUser({ email, password, name = null, isGuest = false }) {
  const users = await getUsers();
  
  if (!isGuest && users.some(u => u.email === email)) {
    throw new Error('Email already exists');
  }

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  const newUser = {
    id: crypto.randomUUID(),
    email,
    name,
    passwordHash,
    isGuest,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  users.push(newUser);
  await saveUsers(users);
  return newUser;
}

export async function updateUser(id, updates) {
  const users = await getUsers();
  const index = users.findIndex(u => u.id === id);
  if (index === -1) throw new Error('User not found');

  // Check email uniqueness if email is being updated
  if (updates.email && updates.email !== users[index].email) {
    if (users.some(u => u.email === updates.email && u.id !== id)) {
      throw new Error('Email already exists');
    }
  }

  // Handle password update
  if (updates.password) {
    const salt = await bcrypt.genSalt(12);
    updates.passwordHash = await bcrypt.hash(updates.password, salt);
    delete updates.password;
  }

  users[index] = { ...users[index], ...updates, updatedAt: new Date().toISOString() };
  await saveUsers(users);
  return users[index];
}

export async function createResetToken(email) {
  const users = await getUsers();
  const index = users.findIndex(u => u.email === email);
  if (index === -1) return null; // Don't throw to prevent leaking email existence

  const token = crypto.randomBytes(32).toString('hex');
  const expires = Date.now() + 3600000; // 1 hour

  users[index].resetToken = token;
  users[index].resetExpires = expires;
  await saveUsers(users);
  return token;
}

export async function resetPasswordWithToken(token, newPassword) {
  const users = await getUsers();
  const index = users.findIndex(u => u.resetToken === token && u.resetExpires > Date.now());
  if (index === -1) throw new Error('Invalid or expired reset token');

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(newPassword, salt);

  users[index].passwordHash = passwordHash;
  users[index].resetToken = null;
  users[index].resetExpires = null;
  users[index].updatedAt = new Date().toISOString();
  
  await saveUsers(users);
  return users[index];
}

function generateOtp() {
  return (Math.floor(100000 + Math.random() * 900000)).toString();
}

export async function createPasswordResetOtp(email) {
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
  const users = await getUsers();
  const user = users.find(u => u.email === email);
  if (!user) return null;

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) return null;

  return user;
}

// --- Session Management ---

export async function getSessions() {
    const data = await readJSON(sessionsFilePath);
    return data ? data.sessions : [];
}

async function saveSessions(sessions) {
    const data = await readJSON(sessionsFilePath) || { version: 1 };
    data.sessions = sessions;
    await writeJSON(sessionsFilePath, data);
}

export async function createSession(userId) {
  const sessions = await getSessions();
  const session = {
    id: crypto.randomUUID(),
    userId,
    createdAt: new Date().toISOString(),
    expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 7 // 7 days
  };
  sessions.push(session);
  await saveSessions(sessions);
  return session;
}

export async function getSession(sessionId) {
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
  const sessions = await getSessions();
  const filtered = sessions.filter(s => s.id !== sessionId);
  await saveSessions(filtered);
}
