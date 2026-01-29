import express, { Request, Response } from 'express';

const app = express();
app.use(express.json());

app.get("/health", (req: Request, res: Response) => {
  res.json({ ok: true });
});

app.post("/generate", async (req: Request, res: Response) => {
  // Day 1はまずダミーでOK（後でVertex AIに置き換える）
  const phrase = req.body?.phrase ?? "";
  res.json({
    phrase,
    results: [
      { text: "赤の他人", score: 9, reason: "慣用句で“反対”が気持ちいい" },
      { text: "冷めた現実", score: 7, reason: "甘さの反転" },
    ],
  });
});

const port = Number(process.env.PORT) || 3000;
app.listen(port, "0.0.0.0", () => console.log(`listening on ${port}`));
