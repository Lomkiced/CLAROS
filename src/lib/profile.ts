import { prisma } from "@/lib/prisma";

export const FREE_WEEKLY_CREDIT_LIMIT = 3;
export const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export interface UserProfileSummary {
  plan: "FREE" | "PRO";
  weeklyCreditsUsed: number;
  creditsResetAt: Date;
}

export async function getProfileForUser(
  userId: string
): Promise<UserProfileSummary | null> {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  try {
    const profile = await prisma.profile.findUnique({
      where: { id: userId },
      select: {
        plan: true,
        weeklyCreditsUsed: true,
        creditsResetAt: true,
      },
    });

    if (!profile) {
      return null;
    }

    const now = new Date();
    const isExpired = now.getTime() >= profile.creditsResetAt.getTime();

    return {
      plan: profile.plan,
      weeklyCreditsUsed: isExpired ? 0 : profile.weeklyCreditsUsed,
      creditsResetAt: profile.creditsResetAt,
    };
  } catch {
    return null;
  }
}

export interface SyncUserProfileParams {
  user: {
    id: string;
    email?: string | null;
    user_metadata?: Record<string, unknown>;
  };
  fullName?: string | null;
  claimSlug?: string | null;
}

export async function syncUserProfileAndClaimKit({
  user,
  fullName,
  claimSlug,
}: SyncUserProfileParams): Promise<{ claimedSlug: string | null }> {
  if (!process.env.DATABASE_URL) {
    return { claimedSlug: null };
  }

  const email = user.email ?? `${user.id}@users.claros.local`;
  const metadataName =
    (user.user_metadata?.full_name as string | undefined) ||
    (user.user_metadata?.name as string | undefined) ||
    null;
  const resolvedFullName = fullName?.trim() || metadataName || null;
  const avatarUrl =
    (user.user_metadata?.avatar_url as string | undefined) || null;
  const creditsResetAt = new Date(Date.now() + ONE_WEEK_MS);

  const existingProfile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { fullName: true },
  });

  await prisma.profile.upsert({
    where: { id: user.id },
    create: {
      id: user.id,
      email,
      fullName: resolvedFullName,
      avatarUrl,
      plan: "FREE",
      weeklyCreditsUsed: 0,
      creditsResetAt,
    },
    update: {
      email,
      ...(resolvedFullName && !existingProfile?.fullName
        ? { fullName: resolvedFullName }
        : {}),
      ...(avatarUrl ? { avatarUrl } : {}),
    },
  });

  const normalizedSlug = claimSlug?.trim() || null;
  let claimedSlug: string | null = null;

  if (normalizedSlug) {
    const unclaimedKit = await prisma.kit.findFirst({
      where: {
        slug: normalizedSlug,
        userId: null,
      },
      select: {
        id: true,
        slug: true,
      },
    });

    if (unclaimedKit) {
      await prisma.kit.update({
        where: { id: unclaimedKit.id },
        data: { userId: user.id },
      });
      claimedSlug = unclaimedKit.slug;
    }
  }

  return { claimedSlug };
}
