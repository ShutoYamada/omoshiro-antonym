import express, { Request, Response } from 'express';
import { generateFunnyAntonym } from './genAiUtils';

const app = express();
app.use(express.json());

app.get("/health", (req: Request, res: Response) => {
  res.json({ ok: true });
});

// ダミー用のエンドポイント(後で消す)
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

app.post("/api/antonym", async (req, res) => {
  const word = String(req.body?.word ?? "").trim();
  if (!word) return res.status(400).json({ error: "word is required" });

  try {
    const result = await generateFunnyAntonym(word);
    return res.json({ result });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ error: e?.message ?? "internal error" });
  }
});

const port = Number(process.env.PORT) || 8080;
app.listen(port, "0.0.0.0", () => console.log(`listening on ${port}`));
