import { ConvexError, v } from "convex/values";
import { MutationCtx, QueryCtx, mutation, query } from "./_generated/server";
import { getUser } from "./users";

export async function hasAccessToOrg(
  ctx: QueryCtx | MutationCtx,
  orgId: string
) {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    return null;
  }

  const user = await getUser(ctx, identity.tokenIdentifier);

  if (!user) {
    return null;
  }

  const hasAccess =
    user.orgIds.some((item) => item === orgId) ||
    user.tokenIdentifier.includes(orgId);

  if (!hasAccess) {
    return null;
  }

  return { user };
}

export const createFile = mutation({
  args: {
    name: v.string(),
    orgId: v.string(),
  },
  handler: async (ctx, args) => {
    const hasAccess = hasAccessToOrg(ctx, args.orgId);
    if (!hasAccess) {
      throw new ConvexError("you do not have access to this org");
    }
    await ctx.db.insert("files", { name: args.name, orgId: args.orgId });
  },
});

export const getFiles = query({
  args: { orgId: v.string() },
  handler: async (ctx, args) => {
    const hasAccess = hasAccessToOrg(ctx, args.orgId);
    if (!hasAccess) {
      throw new ConvexError("you do not have access to this org");
    }
    return await ctx.db
      .query("files")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .collect();
  },
});
