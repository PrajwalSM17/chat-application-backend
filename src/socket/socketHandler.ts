import { Server as SocketIOServer, Socket } from "socket.io";
import { getUserById, updateUserStatus } from "../services/userService";
import { addMessage, getMessagesForUsers } from "../services/messageService";
import { UserStatus } from "../types";

const connectedUsers = new Map<string, string>();

export default (io: SocketIOServer): void => {
  io.on("connection", (socket: Socket) => {
    console.log("New client connected:", socket.id);

    const token = socket.handshake.auth.token;
    let userId: string | null = null;

    try {
      userId = socket.handshake.auth.userId;

      if (userId) {
        console.log(`User ${userId} connected via socket ${socket.id}`);
        connectedUsers.set(userId, socket.id);

        updateUserStatus(userId, "Available")
          .then(() => {
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

    socket.on("send-message", async (messageData) => {
      console.log("Received message:", messageData);
      if (!userId) {
        console.error("No authenticated user ID for message");
        return;
      }

      try {
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

        if (newMessage) {
          const messageToSend = {
            id: newMessage.id,
            senderId: newMessage.senderId,
            receiverId: newMessage.receiverId,
            content: newMessage.content,
            timestamp: newMessage.createdAt,
            isRead: newMessage.read,
            replyTo: newMessage.replyToId,
          };

          const receiverSocketId = connectedUsers.get(messageData.receiverId);
          console.log(
            `Receiver  socket ID: ${receiverSocketId} ${connectedUsers} $` )
          if (receiverSocketId) {
            console.log(
              `Sending message to receiver ${messageData.receiverId}`
            );
            io.to(receiverSocketId).emit("message", messageToSend);
          }

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

    socket.on("update-status", async ({ status }) => {
      console.log(`Status update request from ${userId} to ${status}`);
      if (!userId) {
        console.error("No authenticated user ID for status update");
        return;
      }

      try {
        const success = await updateUserStatus(userId, status as UserStatus);
        if (success) {
          io.emit("status-update", { userId, status });
          console.log(`Broadcast status update: ${userId} -> ${status}`);
        }
      } catch (error) {
        console.error("Error updating status:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);

      if (userId) {
        connectedUsers.delete(userId);

        updateUserStatus(userId, "Offline")
          .then(() => {
            io.emit("status-update", { userId, status: "Offline" });
          })
          .catch((err) =>
            console.error("Error updating status on disconnect:", err)
          );
      }
    });
  });
};
