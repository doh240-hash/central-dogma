import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, model = 'gpt-4o' } = body;

    // Vercel 환경변수 'CHATGPT_API' 확인 (OPENAI_API_KEY도 fallback으로 지원)
    const apiKey = (process.env.CHATGPT_API || process.env.OPENAI_API_KEY || '').trim();

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "Vercel 환경변수 'CHATGPT_API'가 설정되지 않았습니다.",
          code: 'NO_API_KEY',
          message: "Vercel 대시보드 Settings -> Environment Variables에서 'CHATGPT_API'를 추가해 주세요."
        },
        { status: 400 }
      );
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: '전송할 메시지가 올바르지 않습니다.' },
        { status: 400 }
      );
    }

    // OpenAI API 호출
    const targetModel = model === 'gpt-4o' ? 'gpt-4o' : 'gpt-4o-mini';
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: targetModel,
        messages,
        temperature: 0.7,
        max_tokens: 1800,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const errMessage = errData?.error?.message || `OpenAI API 오류 (HTTP ${response.status})`;
      return NextResponse.json(
        {
          error: errMessage,
          code: 'OPENAI_ERROR',
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || '';

    return NextResponse.json({
      reply,
      model: data.model || targetModel,
      usage: data.usage,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '서버 내부 오류가 발생했습니다.';
    console.error('API /api/chat 처리 실패:', error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
