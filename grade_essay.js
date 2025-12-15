import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function gradeEssay(question, studentAnswer, rubric, maxPoint) {
  const prompt = `
Bạn là giáo viên chấm bài nghiêm túc.

CÂU HỎI:
${question}

BÀI LÀM HỌC SINH:
${studentAnswer}

HƯỚNG DẪN CHẤM:
${rubric}

YÊU CẦU:
- Chấm trên thang ${maxPoint} điểm
- Nhận xét ngắn gọn, đúng chuẩn giáo viên
- Trả về JSON:
{
  "score": number,
  "comment": string
}
`;

  const response = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0
  });

  return JSON.parse(response.choices[0].message.content);
}