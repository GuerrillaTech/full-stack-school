import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const prisma = new PrismaClient();

export async function login(username: string, password: string) {
  try {
    const user = await prisma.userAuthentication.findUnique({
      where: { username }
    });

    if (!user) {
      throw new Error('Invalid username or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new Error('Invalid username or password');
    }

    // Update last login
    await prisma.userAuthentication.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    // Set authentication cookie
    cookies().set('user_session', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });

    return user;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

export async function register(
  username: string, 
  email: string, 
  password: string, 
  role: UserRole
) {
  try {
    // Check if username or email already exists
    const existingUser = await prisma.userAuthentication.findFirst({
      where: {
        OR: [
          { username },
          { email }
        ]
      }
    });

    if (existingUser) {
      throw new Error('Username or email already exists');
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const newUser = await prisma.userAuthentication.create({
      data: {
        username,
        email,
        passwordHash,
        role
      }
    });

    return newUser;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}

export async function logout() {
  cookies().delete('user_session');
  redirect('/login');
}

export async function getCurrentUser() {
  const sessionId = cookies().get('user_session')?.value;

  if (!sessionId) {
    return null;
  }

  try {
    const user = await prisma.userAuthentication.findUnique({
      where: { id: sessionId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true
      }
    });

    return user;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

export async function requireAuth(requiredRoles?: UserRole[]) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  if (requiredRoles && !requiredRoles.includes(user.role)) {
    redirect(`/${user.role.toLowerCase()}`);
  }

  return user;
}
