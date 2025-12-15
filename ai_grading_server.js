import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * API CHẤM TỰ LUẬN
 */
app.post("/api/grade-essay", async (req, res) => {
  const { question, studentAnswer, rubric } = req.body;

  if (!question || !studentAnswer) {
    return res.status(400).json({ error: "Thiếu dữ liệu" });
  }

  const prompt = `
Bạn là giáo viên Tin học THCS chấm bài tự luận.

CÂU HỎI:
${question}

BÀI LÀM HỌC SINH:
${studentAnswer}

THANG ĐIỂM TỐI ĐA: ${rubric.max_score}

TIÊU CHÍ CHẤM:
${rubric.criteria.map((c, i) => `${i + 1}. ${c}`).join("\n")}

YÊU CẦU BẮT BUỘC:
- Chấm đúng chương trình THCS
- Không cho điểm vượt quá thang điểm
- Nhận xét ngắn gọn, rõ ràng
- Trả kết quả đúng JSON, KHÔNG giải thích thêm

MẪU TRẢ VỀ:
{
  "score": number,
  "comment": string
}
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      messages: [{ role: "user", content: prompt }]
    });

    const result = JSON.parse(completion.choices[0].message.content);
    res.json(result);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI grading failed" });
  }
});

app.listen(3000, () => {
  console.log("✅ AI chấm tự luận chạy tại http://localhost:3000");
});