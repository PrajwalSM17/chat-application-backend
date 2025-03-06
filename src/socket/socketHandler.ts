// Updated socketHandler.ts for the backend
import { Server as SocketIOServer, Socket } from "socket.io";
import { getUserById, updateUserStatus } from "../services/userService";
import { addMessage, getMessagesForUsers } from "../services/messageService";
import { UserStatus } from "../types";

// To track connected users and their socket IDs
const connectedUsers = new Map<string, string>();

export default (io: SocketIOServer): void => {
  io.on("connection", (socket: Socket) => {
    console.log("New client connected:", socket.id);

    // Extract user ID from auth token
    const token = socket.handshake.auth.token;
    // You would need to implement jwt verification to get the user ID
    // For now, let's assume we have userId from the token
    let userId: string | null = null;

    try {
      // Extract userId from token
      // userId = verifyToken(token).id;
      // For testing, you could use a middleware to attach userId
      userId = socket.handshake.auth.userId;

      if (userId) {
        console.log(`User ${userId} connected via socket ${socket.id}`);
        connectedUsers.set(userId, socket.id);

        // Automatically update status to Available
        updateUserStatus(userId, "Available")
          .then(() => {
            // Broadcast to all users
            io.emit("status-update", { userId, status: "Available" });
            console.log(
              `Updated and broadcast status for ${userId} to Available`
            );
          })
          .catch((err) =>
            console.error("Error updating status on connect:", err)
          );
      }
    } catch (error) {
      console.error("Error extracting user ID from token:", error);
    }

    // Handle send-message event from frontend
    socket.on("send-message", async (messageData) => {
      console.log("Received message:", messageData);
      if (!userId) {
        console.error("No authenticated user ID for message");
        return;
      }

      // In your socket handler
      try {
        // Add sender ID from authenticated user
        const newMessage = await addMessage({
          senderId: userId,
          receiverId: messageData.receiverId,
          content: messageData.content,
          timestamp: new Date().toISOString(),
          isReply: !!messageData.replyTo,
          replyToId: messageData.replyTo || null,
          read:messageData.read || false
        });

        console.log("Saved message to database:", newMessage);

        // Check if newMessage is defined before proceeding
        if (newMessage) {
          // Transform to format expected by frontend
          const messageToSend = {
            id: newMessage.id,
            senderId: newMessage.senderId,
            receiverId: newMessage.receiverId,
            content: newMessage.content,
            timestamp: newMessage.createdAt,
            isRead: newMessage.read,
            replyTo: newMessage.replyToId,
          };

          // Send to receiver if online
          const receiverSocketId = connectedUsers.get(messageData.receiverId);
          console.log(
            `Receiver  socket ID: ${receiverSocketId} ${connectedUsers} $` )
          if (receiverSocketId) {
            console.log(
              `Sending message to receiver ${messageData.receiverId}`
            );
            io.to(receiverSocketId).emit("message", messageToSend);
          }

          // Also confirm to sender
          socket.emit("message-sent", messageToSend);
        } else {
          console.error("Failed to create message: newMessage is undefined");
          socket.emit("message-error", { error: "Failed to save message" });
        }
      } catch (error) {
        console.error("Error saving/sending message:", error);
        socket.emit("message-error", { error: "Failed to send message" });
      }
    });

    // Handle status updates
    socket.on("update-status", async ({ status }) => {
      console.log(`Status update request from ${userId} to ${status}`);
      if (!userId) {
        console.error("No authenticated user ID for status update");
        return;
      }

      try {
        const success = await updateUserStatus(userId, status as UserStatus);
        if (success) {
          // Broadcast to all users
          io.emit("status-update", { userId, status });
          console.log(`Broadcast status update: ${userId} -> ${status}`);
        }
      } catch (error) {
        console.error("Error updating status:", error);
      }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);

      if (userId) {
        // Remove from connected users
        connectedUsers.delete(userId);

        // Update status to offline
        updateUserStatus(userId, "Offline")
          .then(() => {
            // Notify other users
            io.emit("status-update", { userId, status: "Offline" });
          })
          .catch((err) =>
            console.error("Error updating status on disconnect:", err)
          );
      }
    });
  });
};
