import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { image, mimeType, situation } = req.body;
    
    if (!situation) {
      return res.status(400).json({ error: '질문이나 상황 설명이 입력되지 않았습니다.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY 환경 변수가 설정되지 않았습니다.' });
    }

    const ai = new GoogleGenAI({ apiKey: apiKey });
    let contents = [
      `당신은 교통사고 분석 및 법률 법규 전문 AI 검증관입니다. 
      아래 사용자가 입력한 구체적인 질문/상황과 첨부된 미디어(사진 또는 영상)의 객관적 시각 정보만을 바탕으로 분석하십시오.
      
      [할루시네이션 방지 및 정확도 절대 지침]
      1. 추측이나 근거 없는 수치를 절대 지어내지 말 것. 미디어에 명확히 확인되는 팩트와 손해보험협회 과실비율 기준에만 입각해서 답변할 것.
      2. 고정된 답변을 절대 출력하지 말고, 사용자의 질문 유형과 미디어 특성에 맞게 완전히 맞춤형으로 작성할 것.
      3. 답변 내에 논리적 모순이나 오류가 없도록 철저히 교차 검증하여 전문적이고 신뢰도 높은 리포트를 작성할 것.

      [사용자가 입력한 질문 및 상황]
      ${situation}`
    ];

    if (image && !image.includes('placeholder')) {
      const base64Data = image.split(',')[1] || image;
      contents.unshift({
        inlineData: {
          data: base64Data,
          mimeType: mimeType || 'image/jpeg'
        }
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents
    });

    return res.status(200).json({ result: response.text });
  } catch (error) {
    console.error('Gemini API Error:', error);
    return res.status(500).json({ error: error.message || '서버 내부 오류가 발생했습니다.' });
  }
}
