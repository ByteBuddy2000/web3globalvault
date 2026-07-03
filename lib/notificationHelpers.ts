import Notification from "@/models/Notification";
import { Types } from "mongoose";

/**
 * Helper to create notifications for card events
 */
export async function createCardNotification(
  userId: Types.ObjectId | string,
  title: string,
  message: string,
  type: "info" | "success" | "warning" | "error",
  cardId?: Types.ObjectId | string
) {
  try {
    const notification = new Notification({
      user: userId,
      title,
      message,
      type,
      category: "card",
      card: cardId,
    });
    await notification.save();
    return notification;
  } catch (error) {
    console.error("Failed to create card notification:", error);
    return null;
  }
}

/**
 * Helper to create notifications for transactions
 */
export async function createTransactionNotification(
  userId: Types.ObjectId | string,
  title: string,
  message: string,
  type: "info" | "success" | "warning" | "error",
  transactionId?: Types.ObjectId | string
) {
  try {
    const notification = new Notification({
      user: userId,
      title,
      message,
      type,
      category: "transaction",
      transaction: transactionId,
    });
    await notification.save();
    return notification;
  } catch (error) {
    console.error("Failed to create transaction notification:", error);
    return null;
  }
}

/**
 * Helper to create notifications for KYC
 */
export async function createKYCNotification(
  userId: Types.ObjectId | string,
  title: string,
  message: string,
  type: "info" | "success" | "warning" | "error"
) {
  try {
    const notification = new Notification({
      user: userId,
      title,
      message,
      type,
      category: "kyc",
    });
    await notification.save();
    return notification;
  } catch (error) {
    console.error("Failed to create KYC notification:", error);
    return null;
  }
}

/**
 * Create card approval notification
 */
export async function notifyCardApproved(
  userId: Types.ObjectId | string,
  tierLevel: string,
  cardType: string,
  cardId: Types.ObjectId | string
) {
  return createCardNotification(
    userId,
    `✅ Card Approved - ${tierLevel}`,
    `Your ${tierLevel} ${cardType} card has been approved and is now active. You can start using it immediately.`,
    "success",
    cardId
  );
}

/**
 * Create card rejection notification
 */
export async function notifyCardRejected(
  userId: Types.ObjectId | string,
  tierLevel: string,
  cardType: string,
  reason: string,
  cardId: Types.ObjectId | string
) {
  return createCardNotification(
    userId,
    `❌ Card Application Rejected - ${tierLevel}`,
    `Your ${tierLevel} ${cardType} card application has been rejected. Reason: ${reason}. You can apply for a new card.`,
    "error",
    cardId
  );
}

/**
 * Create card blocked notification
 */
export async function notifyCardBlocked(
  userId: Types.ObjectId | string,
  tierLevel: string,
  cardType: string,
  cardId: Types.ObjectId | string
) {
  return createCardNotification(
    userId,
    `🔒 Card Blocked - ${tierLevel}`,
    `Your ${tierLevel} ${cardType} card has been blocked. You can create a new card or unblock it later.`,
    "warning",
    cardId
  );
}

/**
 * Create card canceled notification
 */
export async function notifyCardCanceled(
  userId: Types.ObjectId | string,
  tierLevel: string,
  cardType: string,
  cardId: Types.ObjectId | string
) {
  return createCardNotification(
    userId,
    `❌ Card Canceled - ${tierLevel}`,
    `Your ${tierLevel} ${cardType} card has been canceled. You can now create a new card.`,
    "info",
    cardId
  );
}

/**
 * Create card archived notification (when replaced by new card)
 */
export async function notifyCardArchived(
  userId: Types.ObjectId | string,
  tierLevel: string,
  cardType: string,
  reason: string,
  cardId: Types.ObjectId | string
) {
  return createCardNotification(
    userId,
    `📦 Card Archived - ${tierLevel}`,
    `Your ${tierLevel} ${cardType} card has been archived. ${reason}. Your new card is now active.`,
    "info",
    cardId
  );
}
