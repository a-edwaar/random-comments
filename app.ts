import express from "express";
import { PrismaClient } from "@prisma/client";

const app = express();
const db = new PrismaClient();
const port = 3000;

db.$connect();

app.use(express.json());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.get(
  "/api/comments",
  async (_req: express.Request, res: express.Response) => {
    const comments = await db.comment.findMany();
    res.send(comments);
  }
);

app.post(
  "/api/comments",
  async (req: express.Request, res: express.Response) => {
    const { name, avatarURL, content } = req.body;
    console.log(name, avatarURL, content);
    if (
      typeof name !== "string" ||
      typeof avatarURL !== "string" ||
      typeof content !== "string"
    ) {
      return res.status(400).send("Bad request");
    }
    try {
      const comment = await db.comment.create({
        data: {
          name,
          avatarURL,
          content,
        },
      });
      console.log(`New comment with id: ${comment.id}`);
      res.send(comment);
    } catch (e) {
      console.error(e);
      res.status(500).send("Internal server error");
    }
  }
);

app.post(
  "/api/comments/:id",
  async (req: express.Request, res: express.Response) => {
    const { id } = req.params;
    try {
      const updatedComment = await db.comment.update({
        where: {
          id,
        },
        data: {
          upvotes: {
            increment: 1,
          },
        },
      });
      console.log(`Comment with id: ${updatedComment.id} has been upvoted`);
      res.send(updatedComment);
    } catch (e) {
      res.status(500).send("Internal server error");
    }
  }
);

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
      res.status(501).send("Internal server error");
    }
  }
);

app.listen(port, () => {
  console.log(`Server is running on port ${port}.`);
});
