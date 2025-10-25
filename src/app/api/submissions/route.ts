import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateImage, comparePrompts } from '@/lib/openai';
import type { CreateSubmissionRequest } from '@/types';

export async function POST(request: Request) {
  try {
    const body: CreateSubmissionRequest = await request.json();
    const { room_id, name, prompt } = body;

    // バリデーション
    if (!room_id || !name || !prompt) {
      return NextResponse.json(
        { error: '必須項目が不足しています' },
        { status: 400 }
      );
    }

    if (prompt.length > 1000) {
      return NextResponse.json(
        { error: 'プロンプトは1000文字以内にしてください' },
        { status: 400 }
      );
    }

    // ルーム情報を取得
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('model_prompt')
      .eq('id', room_id)
      .single();

    if (roomError || !room) {
      return NextResponse.json(
        { error: 'ルームが見つかりませんでした' },
        { status: 404 }
      );
    }

    // 画像生成
    console.log('画像生成中...');
    const generatedImageUrl = await generateImage(prompt);

    // 類似度採点
    console.log('類似度採点中...');
    const similarityScore = await comparePrompts(
      room.model_prompt || '',
      prompt
    );

    // DB保存
    const { data: submission, error: insertError } = await supabase
      .from('users')
      .insert({
        room_id,
        name,
        prompt,
        resultimage: generatedImageUrl,
        similarity_score: similarityScore,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json(
        { error: '投稿の保存に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: submission,
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}

