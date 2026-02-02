import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  vertexai: true,
  project: process.env.GOOGLE_CLOUD_PROJECT,
  location: "global",
  apiVersion: 'v1'
});
const model = 'gemini-3-flash-preview';

const generationConfig = {
  maxOutputTokens: 65535,
  temperature: 1,
  topP: 0.95,
  seed: 0,
};


/**
 * 対義語の生成処理
 */
export async function generateFunnyAntonym(word: string, style?: string) {
      const prompt = `
あなたは「おもしろ対義語ジェネレータ」です。
入力語: 「${word}」
${style ? `テイスト: 「${style}」` : ""}
条件:
- 厳密な辞書的対義語でなくてよい
- ただし元の語と“対”になっている納得感は残す
- テイストと合致していること
- 可能なら既存の慣用句やことわざ、商標をうまく利用すること(例: 「赤の他人」→「白い恋人」)
- 語呂合わせもOK
- 字面の面白さ、突拍子もなさがあってもいい
- 10個出す
- それぞれに短い理由（1行）とスコア(0-10)を添える
出力はJSONで:
{"candidates":[{"antonym":"...","reason":"...",score:8}]}
`.trim();

  const req = {
    model: model,
    contents: [
      {role: 'user', parts: [{text: prompt}]}
    ],
    config: generationConfig,
  };
  const streamingResp = await ai.models.generateContentStream(req);
  let fullText = '';
  for await (const chunk of streamingResp) {
    if (chunk.text) {
      fullText += chunk.text;
    }
  }
  const cleaned = fullText
    .replace(/```json\s*/i, "")
    .replace(/```$/, "")
    .trim();

  return JSON.parse(cleaned)
}