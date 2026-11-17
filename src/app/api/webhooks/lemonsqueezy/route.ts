import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface LemonSqueezyWebhookPayload {
  meta?: {
    event_name?: string;
    custom_data?: {
      user_id?: string;
    };
  };
  data?: {
    id?: string;
    attributes?: {
      customer_id?: number | string;
      user_email?: string;
      status?: string;
    };
  };
}

function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string
): boolean {
  if (!signatureHeader) {
    return false;
  }

  const expectedDigest = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  const expectedBuffer = Buffer.from(expectedDigest, "utf8");
  const receivedBuffer = Buffer.from(signatureHeader, "utf8");

  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
}

export async function POST(request: Request) {
  const webhookSecret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "LEMONSQUEEZY_WEBHOOK_SECRET is not configured." },
      { status: 500 }
    );
  }

  const rawBody = await request.text();
  const signature = request.headers.get("X-Signature");

  if (!verifyWebhookSignature(rawBody, signature, webhookSecret)) {
    return NextResponse.json(
      { error: "Invalid webhook signature." },
      { status: 401 }
    );
  }

  let payload: LemonSqueezyWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as LemonSqueezyWebhookPayload;
  } catch {
    return NextResponse.json(
      { error: "Malformed JSON webhook body." },
      { status: 400 }
    );
  }

  const eventName = payload.meta?.event_name;
  const userId = payload.meta?.custom_data?.user_id;
  const customerId = payload.data?.attributes?.customer_id
    ? String(payload.data.attributes.customer_id)
    : undefined;
  const userEmail = payload.data?.attributes?.user_email;
  const subscriptionStatus = payload.data?.attributes?.status;

  if (!eventName) {
    return NextResponse.json({ received: true });
  }

  const isUpgradeEvent =
    eventName === "subscription_created" ||
    eventName === "subscription_resumed" ||
    (eventName === "subscription_updated" &&
      (subscriptionStatus === "active" || subscriptionStatus === "on_trial"));

  const isDowngradeEvent =
    eventName === "subscription_cancelled" ||
    eventName === "subscription_expired" ||
    (eventName === "subscription_updated" &&
      (subscriptionStatus === "expired" || subscriptionStatus === "unpaid"));

  if (!isUpgradeEvent && !isDowngradeEvent) {
    return NextResponse.json({ received: true, ignored: eventName });
  }

  const nextPlan = isUpgradeEvent ? "PRO" : "FREE";

  if (userId) {
    await prisma.profile.updateMany({
      where: { id: userId },
      data: {
        plan: nextPlan,
        ...(customerId ? { lemonSqueezyCustomerId: customerId } : {}),
      },
    });
  } else if (customerId) {
    await prisma.profile.updateMany({
      where: { lemonSqueezyCustomerId: customerId },
      data: { plan: nextPlan },
    });
  } else if (userEmail) {
    await prisma.profile.updateMany({
      where: { email: userEmail },
      data: {
        plan: nextPlan,
        ...(customerId ? { lemonSqueezyCustomerId: customerId } : {}),
      },
    });
  }

  return NextResponse.json({
    received: true,
    event: eventName,
    plan: nextPlan,
  });
}
