app.post("/cham-bai", async (req, res) => {
  const { cauHoi, dapAn, baiLam } = req.body;

  const prompt = `
Câu hỏi: ${cauHoi}
Đáp án chuẩn: ${dapAn}
Bài làm HS: ${baiLam}
Chấm điểm 0–10 và nhận xét, trả JSON.
`;

  const result = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0
  });

  res.json(JSON.parse(result.choices[0].message.content));
});