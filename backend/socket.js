import cookieParser from "cookie-parser";
import { authRequired } from "./middleware/authMiddleware.js";

export function configureChatSockets(io) {
  const parseCookies = cookieParser();

  io.use((socket, next) => {
    const reject = () => next(new Error("Not authenticated."));
    // Adapt the same cookie/session check used by the HTTP API. A socket
    // handshake has a request, but no Express response to send a 401 through.
    const response = {
      status() { return this; },
      json: reject,
    };
    parseCookies(socket.request, response, (error) => {
      if (error) return reject();
      return authRequired(socket.request, response, () => {
        socket.data.userId = String(socket.request.user._id);
        next();
      });
    });
  });

  io.on("connection", (socket) => {
    // Never accept a room/user ID from the client, including legacy join events.
    socket.join(socket.data.userId);
  });
}
