import express, { Request, Response } from 'express';
import cors from "cors";
import { generateFunnyAntonym } from './genAiUtils';

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: '*',
    credentials: true,
    optionsSuccessStatus: 200
})
)

app.get("/health", (req: Request, res: Response) => {
  res.json({ ok: true });
});

app.post("/api/antonym", async (req, res) => {
  const word = String(req.body?.word ?? "").trim();
  const style = String(req.body?.style ?? "").trim();
  if (!word) return res.status(400).json({ error: "word is required" });

  try {
    const result = await generateFunnyAntonym(word, style);
    return res.json({ result });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ error: e?.message ?? "internal error" });
  }
});

const port = Number(process.env.PORT) || 8080;
app.listen(port, "0.0.0.0", () => console.log(`listening on ${port}`));
