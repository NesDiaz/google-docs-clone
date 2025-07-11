"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import {
  LiveblocksProvider,
  ClientSideSuspense,
} from "@liveblocks/react/suspense";
import { RoomProvider } from "@liveblocks/react";
import { useParams } from "next/navigation";
import { FullscreenLoader } from "@/components/fullscreen-loader";
import { getUsers, getDocuments } from "./actions";
import { toast } from "sonner";
import { Id } from "../../../../convex/_generated/dataModel";
import {
  RIGHT_MARGIN_DEFAULT,
  LEFT_MARGIN_DEFAULT,
} from "@/constants/margins";

type User = { id: string; name: string; avatar: string; color: string };

export function Room({ children }: { children: ReactNode }) {
  const params = useParams();
  const [users, setUsers] = useState<User[]>([]);

  const fetchUsers = useMemo(
    () => async () => {
      try {
        const list = await getUsers();
        setUsers(list);
      } catch {
        toast.error("Failed to fetch users");
      }
    },
    []
  );

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <LiveblocksProvider
      throttle={16}
      authEndpoint="/api/liveblocks-auth"
      resolveUsers={({ userIds }) =>
        userIds.map((userId) => {
          const user = users.find((u) => u.id === userId);
          return user
            ? {
                name: user.name,
                avatar: user.avatar,
                color: user.color,
              }
            : undefined;
        })
      }
      resolveMentionSuggestions={({ text }) => {
        let filtered = users;
        if (text) {
          filtered = users.filter((u) =>
            u.name.toLowerCase().includes(text.toLowerCase())
          );
        }
        return filtered.map((u) => u.id);
      }}
      resolveRoomsInfo={async ({ roomIds }) => {
        const documents = await getDocuments(roomIds as Id<"documents">[]);
        return documents.map((doc) => ({
          id: doc.id,
          name: doc.name,
        }));
      }}
    >
      <RoomProvider
        id={params.documentId as string}
        initialStorage={{
          leftMargin: LEFT_MARGIN_DEFAULT,
          rightMargin: RIGHT_MARGIN_DEFAULT,
        }}
      >
        <ClientSideSuspense fallback={<FullscreenLoader label="Room loading..." />}>
          {children}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
}


// "use client";

// import { ReactNode, useEffect, useMemo, useState } from "react";
// import {
//   LiveblocksProvider,
//   RoomProvider,
//   ClientSideSuspense,
// } from "@liveblocks/react/suspense";
// import { useParams } from "next/navigation";
// import { FullscreenLoader } from "@/components/fullscreen-loader";
// import { getUsers, getDocuments } from "./actions";
// import { toast } from "sonner";
// import { Id } from "../../../../convex/_generated/dataModel";
// import { RIGHT_MARGIN_DEFAULT, LEFT_MARGIN_DEFAULT } from "@/constants/margins";


// type User = { id: string; name: string; avatar: string; color: string };


// export function Room({ children }: { children: ReactNode }) {
//     const params = useParams();

//     const [users, setUsers] = useState<User[]>([]);

//     const fetchUsers = useMemo(
//       () => async () => {
//         try {
//           const list = await getUsers();
//           setUsers(list);
//         } catch {
//           toast.error("Failed to fetch users");
//         }
//       },
//       [],
//     );

//     useEffect(() => {
//       fetchUsers();
//     }, [fetchUsers]);

//   return (
//     <LiveblocksProvider 
//       throttle={16}
//       authEndpoint={async () => {
//         const endpoint = "/api/liveblocks-auth";
//         const room = params.documentId as string;

//         const response = await fetch(endpoint, {
//           method: "POST",
//           body: JSON.stringify({ room }),
//           headers: {
//             "Content-Type": "application/json",
//           },
//         });
//         if (!response.ok) {
//           const message = await response.text();
//           console.error("Auth error:", message);
//           throw new Error("Liveblocks auth failed");
//         }

//         return await response.json();
//       }}
//       resolveUsers={({ userIds }) => {
//         return userIds.map(
//           (userId) => {
//             const user = users.find((u) => u.id === userId);
//             return user ? {
//               name: user.name,
//               avatar: user.avatar,
//               color: user.color,
//             } : undefined;
//           }
//         );
//       }}
//       resolveMentionSuggestions={({ text }) => {
//         let filteredUsers = users;

//         if (text) {
//           filteredUsers = users.filter((user) =>
//           user.name.toLowerCase().includes(text.toLowerCase())
//         );
//         }
//         return filteredUsers.map((user) => user.id);
//       }}
//       resolveRoomsInfo={async ({ roomIds }) => {
//         const documents = await getDocuments(roomIds as Id<"documents">[]);
//         return documents.map((document) => ({
//           id: document.id,
//           name: document.name,
//         }));
//       }}
//     >
//       <RoomProvider
//   id={params.documentId as string}
//   initialStorage={{ leftMargin: LEFT_MARGIN_DEFAULT, rightMargin: RIGHT_MARGIN_DEFAULT }}
// >
//   <ClientSideSuspense fallback={<FullscreenLoader label="Room loading..." />}>
//     {children}
//   </ClientSideSuspense>
// </RoomProvider>

//     </LiveblocksProvider>
//   );
// }