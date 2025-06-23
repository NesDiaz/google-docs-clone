import { Liveblocks } from "@liveblocks/node";
import { ConvexHttpClient } from "convex/browser";
import { auth, currentUser } from "@clerk/nextjs/server";
import { api } from "../../../../convex/_generated/api";

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY!,
});

export async function POST(req: Request) {
  // ✅ First, resolve auth() to get session
  const authResult = await auth();

  if (!authResult.sessionClaims) {
    return new Response("Unauthorized", { status: 401 });
  }

  const user = await currentUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const token = await authResult.getToken({ template: "convex" });
  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }

  // ✅ Initialize Convex and pass the Clerk token
  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  convex.setAuth(token); // ✅ Correct usage (not a function)

  // ✅ Get room ID and validate access
  const { room } = await req.json();
  const result = await convex.query(api.documents.getById, { id: room });
  const { document, isOwner, isOrganizationMember } = result;

  if (!document || (!isOwner && !isOrganizationMember)) {
    return new Response("Unauthorized", { status: 401 });
  }

  // ✅ Prepare user session for Liveblocks
  const name =
  user.fullName ??
  user.firstName ??
  user.username ??
  user.primaryEmailAddress?.emailAddress ??
  "Anonymous";

  const nameToNumber = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hue = Math.abs(nameToNumber) % 360;
  const color = `hsl(${hue}, 80%, 60%)`;

  const session = liveblocks.prepareSession(user.id, {
    userInfo: {
      name: user.fullName ?? user.primaryEmailAddress?.emailAddress ?? "Anonymous",
      avatar: user.imageUrl,
      color,
    },
  });

  session.allow(room, session.FULL_ACCESS);
  const { body, status } = await session.authorize();

  return new Response(body, { status });
}


// import { Liveblocks } from "@liveblocks/node";
// import { ConvexHttpClient } from "convex/browser";
// import { auth, currentUser } from "@clerk/nextjs/server";
// import { api } from "../../../../convex/_generated/api";

// const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
// const liveblocks = new Liveblocks({
//     secret: process.env.LIVEBLOCKS_SECRET_KEY!,
// });

// export async function POST(req: Request) {
//     const { sessionClaims } = await auth();
//     if (!sessionClaims) {
//         return new Response("Unauthorized", { status: 401 });
//     }

//     const user = await currentUser();
//         if (!user) {
//             return new Response("Unauthorized", { status: 401 });
//         }

//         const { room } = await req.json();
//         const result = await convex.query(api.documents.getById, { id: room });
//         const { document, isOwner, isOrganizationMember } = result;


//         if (!document) {
//             return new Response("Unauthorized", { status: 401 });
//         }


//         if (!isOwner && !isOrganizationMember) {
//             return new Response("Unauthorized", { status: 401 });
//           }
          

//         const name =   user.fullName ?? user.primaryEmailAddress?.emailAddress ?? "Anonymous";
//         const nameToNumber = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
//         const hue = Math.abs(nameToNumber) % 360;
//         const color = `hsl(${hue}, 80% 60%)`;

//         const session = liveblocks.prepareSession(user.id, {
//             userInfo: {
//                 name,
//                 avatar: user.imageUrl,
//                 color,
//             },
//         });
//         session.allow(room, session.FULL_ACCESS);
//         const { body, status } = await session.authorize();

//         return new Response(body, { status });
// };