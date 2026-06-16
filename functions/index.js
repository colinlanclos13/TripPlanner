const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const logger = require("firebase-functions/logger");
const fetch = require("node-fetch");
const admin = require("firebase-admin");
admin.initializeApp();

const { onDocumentUpdated } = require("firebase-functions/v2/firestore");


exports.notifyUserOnTripInvite = onDocumentCreated(
  "users/{userId}/trips/{tripId}",
  async (event) => {
    const userId = event.params.userId;
    const db = event.data && event.data.ref && event.data.ref.firestore;

    if (!db) return;

    try {
      // Get user's push token
      const userDoc = await db.doc(`users/${userId}`).get();
      const pushToken = userDoc.get("pushToken");

      if (!pushToken) {
        logger.warn(`No push token for user ${userId}`);
        return;
      }

      const message = {
        to: pushToken,
        sound: "default",
        title: "Trip Invitation",
        body: "You've been invited to a new trip!",
        data: { tripId: event.params.tripId },
      };

      // Send push notification via Expo
      await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Accept-Encoding": "gzip, deflate",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      });

      logger.info(`Sent push notification to ${userId}`);
    } catch (error) {
      logger.error("Error sending notification:", error);
    }
  },
);

exports.syncTripUpdates = onDocumentUpdated(
  "trip/{tripId}",
  async (event) => {
    const change = event.data;
    if (!change) return;

    const after = change.after.data();
    const tripId = event.params.tripId;

    const db = admin.firestore();


    //updates object

    const updates = {};

    if (after.address != null) {
      updates.address = after.address;
    }

    if (after.dates != null) {
      updates.dates = after.dates;
    }

    // If nothing to update, stop early
    if (Object.keys(updates).length === 0) {
      logger.info("No valid fields to sync", { tripId });
      return;
    }

    try {

      //Get guest list 
      const guestSnap = await db.doc(`trip/${tripId}/Guest/List`).get();

      if (!guestSnap.exists) {
        logger.warn("Guest list missing", { tripId });
        return;
      }

      const guestData = guestSnap.data() || {};
      const values = Object.values(guestData);

      logger.info("Guest count", { count: values.length });

      //Batch update users
      const batch = db.batch();

      values.forEach((guest) => {
        const userId = guest && guest[2];

        if (!userId) {
          logger.warn("Missing userId in guest", { guest });
          return;
        }

        batch.update(
          db.doc(`users/${userId}/trips/${tripId}`),
          updates,
        );
      });

      await batch.commit();

      logger.info("Synced trip updates successfully", {
        tripId,
        updates,
      });
    } catch (err) {
      logger.error("Sync failed:", err);
    }
  },
);
