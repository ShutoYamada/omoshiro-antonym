import { useMemo, useState } from "react";
import "./App.css";

type StyleKey = "classic" | "chuunibyou" | "loose" | "horror" | "business";

type Candidate = {
  antonym: string;
  reason: string;
  score?: number;
};

type ApiResponse = {
  candidates: Candidate[];
};

const STYLES: { key: StyleKey; label: string; hint: string }[] = [
  { key: "classic", label: "王道", hint: "納得感重視" },
  { key: "chuunibyou", label: "厨二", hint: "カッコよさ・闇" },
  { key: "loose", label: "ゆるい", hint: "脱力・かわいい" },
  { key: "horror", label: "ホラー", hint: "不穏・怖い" },
  { key: "business", label: "ビジネス", hint: "固い言い換え" },
];

function getApiBaseUrl(): string {
  return (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");
}

async function callGenerate(word: string, style: StyleKey): Promise<ApiResponse> {
  const base = getApiBaseUrl();
  if (!base) throw new Error("VITE_API_BASE_URL が未設定です");

  const res = await fetch(`${base}/api/antonym`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ word, style }),
  });

  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const result = ((await res.json()) as {result: ApiResponse}).result;
  // return safeParseCandidates(result);
  return result;
}

export default function App() {
  const [word, setWord] = useState("");
  const [style, setStyle] = useState<StyleKey>("classic");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  const styleHint = useMemo(
    () => STYLES.find((s) => s.key === style)?.hint ?? "",
    [style]
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!word.trim()) {
      setError("単語を入力してください");
      return;
    }

    setLoading(true);
    setError(null);
    setCandidates([]);

    try {
      const res = await callGenerate(word.trim(), style);
      setCandidates(res.candidates);
      if (!res.candidates.length) setError("候補が取得できませんでした");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message ?? String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="container">
        <header className="header">
          <span className="badge">AI Hackathon MVP</span>
          <h1>おもしろ対義語ジェネレータ</h1>
          <p className="subtitle">
            単語を入れると「いちばん面白い対義語」を生成します
          </p>
        </header>

        <section className="card">
          <form className="form" onSubmit={onSubmit}>
            <label>
              入力単語
              <input
                value={word}
                onChange={(e) => setWord(e.target.value)}
                placeholder="例: 白い恋人"
                disabled={loading}
              />
            </label>

            <label>
              テイスト
              <div className="styleRow">
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value as StyleKey)}
                  disabled={loading}
                >
                  {STYLES.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <span className="hint">{styleHint}</span>
              </div>
            </label>

            <button className="primary" disabled={loading}>
              {loading ? "生成中..." : "生成する"}
            </button>

            {error && <div className="error">{error}</div>}
          </form>
        </section>

        <section className="results">
          {candidates.map((c, i) => (
            <div className="resultCard" key={i}>
              <div className="resultHeader">
                <span className="antonym">{c.antonym}</span>
                {c.score != null && <span className="score">Score {c.score}</span>}
              </div>
              <p className="reason">{c.reason}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
