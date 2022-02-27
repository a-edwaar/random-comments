import express from "express";
import { PrismaClient } from "@prisma/client";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const db = new PrismaClient();
const port = 3000;

db.$connect();

app.use(express.json());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

/*
GET /api/comments - Get all comments
*/
app.get(
  "/api/comments",
  async (_req: express.Request, res: express.Response) => {
    const comments = await db.comment.findMany({
      where: {
        parentId: null,
      },
      include: {
        replies: true,
      },
    });
    res.send(comments);
  }
);

/*
POST /api/comments - Create a new comment
*/
app.post(
  "/api/comments",
  async (req: express.Request, res: express.Response) => {
    const { name, avatarURL, content, parentId } = req.body;
    if (
      typeof name !== "string" ||
      typeof avatarURL !== "string" ||
      typeof content !== "string"
    ) {
      return res.status(301).redirect("/?error=bad-request");
    }
    try {
      const comment = await db.comment.create({
        data: {
          name,
          avatarURL,
          content,
          parentId,
        },
      });
      console.log(`New comment with id: ${comment.id}`);
      res.status(301).redirect("/");
    } catch (e) {
      console.error(e);
      res.status(500).redirect("/?error=internal");
    }
  }
);

/*
POST /api/comments/:id - Upvote a comment
*/
app.post(
  "/api/comments/:id",
  async (req: express.Request, res: express.Response) => {
    const { id } = req.params;
    const { upvoted } = req.body;
    if (typeof upvoted !== "boolean") {
      return res.status(400).send("Bad request");
    }
    try {
      const updatedComment = await db.comment.update({
        where: {
          id,
        },
        data: {
          upvotes: {
            increment: upvoted ? -1 : 1,
          },
        },
      });
      console.log(`Comment with id: ${updatedComment.id} has been upvoted`);
      io.emit("upvote", updatedComment);
      res.send(updatedComment);
    } catch (e) {
      console.error(e);
      res.status(501).send("Internal server error");
    }
  }
);

/*
DELETE /api/comments/:id - Delete a comment for testing purposes
*/
app.delete(
  "/api/comments/:id",
  async (req: express.Request, res: express.Response) => {
    const { id } = req.params;
    try {
      await db.comment.delete({
        where: {
          id,
        },
      });
      console.log(`Comment with id: ${id} has been deleted`);
      res.send();
    } catch (e) {
      console.error(e);
      res.status(501).send("Internal server error");
    }
  }
);

io.on("connection", (socket) => {
  console.log("client connected");

  socket.on("disconnect", () => {
    console.log("client disconnected");
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}.`);
});
