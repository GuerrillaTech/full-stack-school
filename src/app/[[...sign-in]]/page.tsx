"use client";

import * as Clerk from "@clerk/elements/common";
import { SignIn } from "@clerk/elements/sign-in";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";

interface SignInRootProps {
  children?: ReactNode;
  exampleMode?: boolean;
  fallback?: ReactNode;
  path?: string;
  routing?: 'hash' | 'path';
}

const LoginPage: React.FC<SignInRootProps> = ({ 
  exampleMode = false, 
  fallback, 
  path, 
  routing 
}) => {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      const role = user?.publicMetadata.role as string;
      if (role) {
        router.push(`/${role}`);
      }
    }
  }, [isLoaded, isSignedIn, user, router]);

  return (
    <div className="h-screen flex items-center justify-center bg-lamaSkyLight">
      <div className="bg-white p-12 rounded-md shadow-2xl flex flex-col gap-2 w-full max-w-md">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Image src="/logo.png" alt="" width={24} height={24} />
          SchooLama
        </h1>
        <h2 className="text-gray-400">Sign in to your account</h2>
        
        <SignIn>
          {() => (
            <SignIn.Step name="start" className="flex flex-col gap-4">
              <Clerk.GlobalError className="text-sm text-red-400" />
              
              <Clerk.Field name="identifier" className="flex flex-col gap-2">
                <Clerk.Label className="text-xs text-gray-500">
                  Username
                </Clerk.Label>
                <Clerk.Input
                  type="text"
                  required
                  className="p-2 rounded-md ring-1 ring-gray-300"
                />
                <Clerk.FieldError className="text-xs text-red-400" />
              </Clerk.Field>
              
              <Clerk.Field name="password" className="flex flex-col gap-2">
                <Clerk.Label className="text-xs text-gray-500">
                  Password
                </Clerk.Label>
                <Clerk.Input
                  type="password"
                  required
                  className="p-2 rounded-md ring-1 ring-gray-300"
                />
                <Clerk.FieldError className="text-xs text-red-400" />
              </Clerk.Field>
              
              <SignIn.Action
                submit
                className="bg-blue-500 text-white my-1 rounded-md text-sm p-[10px] w-full"
              >
                Sign In
              </SignIn.Action>
            </SignIn.Step>
          )}
        </SignIn>
      </div>
    </div>
  );
};

export default LoginPage;
