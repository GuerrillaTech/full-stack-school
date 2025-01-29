import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { UserRole } from '@prisma/client';

// Define route access map
const routeAccessMap: { [key: string]: UserRole[] } = {
  "/admin(.*)": ["ADMIN"],
  "/student(.*)": ["STUDENT"],
  "/teacher(.*)": ["TEACHER"],
  "/parent(.*)": ["PARENT"],
  "/list/teachers": ["ADMIN", "TEACHER"],
  "/list/students": ["ADMIN", "TEACHER"],
  "/list/parents": ["ADMIN", "TEACHER"],
  "/list/subjects": ["ADMIN"],
  "/list/classes": ["ADMIN", "TEACHER"],
  "/list/exams": ["ADMIN", "TEACHER", "STUDENT", "PARENT"],
  "/list/assignments": ["ADMIN", "TEACHER", "STUDENT", "PARENT"],
  "/list/results": ["ADMIN", "TEACHER", "STUDENT", "PARENT"],
  "/list/attendance": ["ADMIN", "TEACHER", "STUDENT", "PARENT"],
  "/list/events": ["ADMIN", "TEACHER", "STUDENT", "PARENT"],
  "/list/announcements": ["ADMIN", "TEACHER", "STUDENT", "PARENT"],
};

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const session = req.cookies.get('user_session')?.value;

  // Public routes
  const publicPaths = ['/login', '/register'];
  if (publicPaths.includes(path)) {
    return NextResponse.next();
  }

  // Check if user is authenticated
  if (!session) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Validate route access based on role
  const matchingRoute = Object.keys(routeAccessMap).find(route => 
    new RegExp(route).test(path)
  );

  if (matchingRoute) {
    // Fetch user role from session (you'll need to implement this)
    const userRole = await getUserRoleFromSession(session);

    if (!userRole) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    const allowedRoles = routeAccessMap[matchingRoute];
    if (!allowedRoles.includes(userRole)) {
      // Redirect to default route for user's role
      return NextResponse.redirect(new URL(`/${userRole.toLowerCase()}`, req.url));
    }
  }

  return NextResponse.next();
}

// Helper function to get user role from session
async function getUserRoleFromSession(sessionId: string): Promise<UserRole | null> {
  try {
    const prisma = (await import('@prisma/client')).PrismaClient;
    const db = new prisma();
    
    const user = await db.userAuthentication.findUnique({
      where: { id: sessionId },
      select: { role: true }
    });

    return user?.role || null;
  } catch (error) {
    console.error('Error fetching user role:', error);
    return null;
  }
}

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
    // Include all routes in routeAccessMap
    "/admin(.*)",
    "/student(.*)",
    "/teacher(.*)",
    "/parent(.*)",
    "/list/:path*"
  ],
};
