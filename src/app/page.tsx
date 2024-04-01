"use client";

import { Button } from "@/components/ui/button";
import {
  SignInButton,
  SignOutButton,
  SignedIn,
  SignedOut,
  useOrganization,
  useUser,
} from "@clerk/clerk-react";
import { api } from "../../convex/_generated/api";
import { useMutation, useQuery } from "convex/react";

export default function Home() {
  const organization = useOrganization();
  const user = useUser();
  let orgId: string | undefined = undefined;

  if (user && organization) {
    orgId = organization.organization?.id || user.user?.id;
  }

  const files = useQuery(api.files.getFiles, orgId ? { orgId } : "skip");
  const createFile = useMutation(api.files.createFile);
  console.log(process.env.CLERK_HOSTNAME, "hgfdfghjk");
  console.log(process.env.NEXT_PUBLIC_CONVEX_URL);

  return (
    <main className='flex min-h-screen flex-col items-center justify-between p-24'>
      <SignedIn>
        <SignOutButton>
          <Button>Sign Out</Button>
        </SignOutButton>
      </SignedIn>
      <SignedOut>
        <SignInButton mode='modal'>
          <Button>Sign In</Button>
        </SignInButton>
      </SignedOut>
      {files?.map((file) => {
        return <p key={file._id}>{file.name}</p>;
      })}
      <Button
        onClick={() => {
          if (!orgId) {
            return null;
          }
          createFile({
            name: "hello world",
            orgId,
          });
        }}
      >
        Click me
      </Button>
    </main>
  );
}
