import OpenAI from 'openai';

function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
  });
}

/**
 * DALL-E 3を使用して画像を生成
 */
export async function generateImage(prompt: string): Promise<string> {
  const openai = getOpenAIClient();
  try {
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
    });

    if (!response.data || response.data.length === 0) {
      throw new Error('画像データが取得できませんでした');
    }

    const imageUrl = response.data[0]?.url;
    if (!imageUrl) {
      throw new Error('画像URLが取得できませんでした');
    }

    return imageUrl;
  } catch (error) {
    console.error('画像生成エラー:', error);
    throw new Error('画像の生成に失敗しました');
  }
}

/**
 * GPT-4を使用して2つのプロンプトの類似度を採点
 */
export async function comparePrompts(
  modelPrompt: string,
  userPrompt: string
): Promise<number> {
  const openai = getOpenAIClient();
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `あなたは画像生成プロンプトの類似度を評価する専門家です。
2つのプロンプトを比較し、以下の基準で0-100のスコアを算出してください：

評価基準:
- 主要な被写体の一致度（40点）
- 構図・アングルの類似性（20点）
- 色彩・ムードの類似性（20点）
- スタイル・雰囲気の類似性（20点）

最終的なスコアのみを数値で返してください。例: 85`,
        },
        {
          role: 'user',
          content: `模範プロンプト: "${modelPrompt}"

ユーザープロンプト: "${userPrompt}"`,
        },
      ],
      max_tokens: 50,
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content || '0';
    const score = parseInt(content.match(/\d+/)?.[0] || '0', 10);
    
    return Math.min(Math.max(score, 0), 100);
  } catch (error) {
    console.error('プロンプト比較エラー:', error);
    return 50;
  }
}

/**
 * GPT-4 Visionを使用して画像から最適なプロンプトを生成
 */
export async function generatePromptFromImage(imageUrl: string): Promise<string> {
  const openai = getOpenAIClient();
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `この画像を詳細に分析し、DALL-E 3で同じような画像を生成するための最適なプロンプトを英語で作成してください。
              
プロンプトには以下を含めてください:
- 主要な被写体
- 構図とアングル
- 色彩とムード
- スタイルや雰囲気
- 照明や時間帯

簡潔で効果的なプロンプトを1-2文で返してください。`,
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
                detail: 'high',
              },
            },
          ],
        },
      ],
      max_tokens: 200,
    });

    return response.choices[0]?.message?.content || 'A beautiful scene';
  } catch (error) {
    console.error('プロンプト生成エラー:', error);
    throw new Error('プロンプトの生成に失敗しました');
  }
}

