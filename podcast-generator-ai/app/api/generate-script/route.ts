import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { title, content } = await request.json();

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    // Generate podcast script using OpenAI
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a professional podcast host creating engaging single-host podcast episodes. Your task is to transform written content into a natural, conversational podcast script that sounds like a friendly, knowledgeable host speaking directly to their audience.

Guidelines:
- Start EXACTLY with: "Hey everyone welcome to the podcast, in this podcast we are gonna talk about [brief topic description]..."
- Use a conversational, engaging tone
- Break down complex topics into digestible segments
- Include natural transitions and pauses (indicated by ... or brief phrases)
- Add personal commentary and insights
- Keep it engaging and informative
- Use "we", "you", and "I" to create connection with listeners
- Include calls to engagement like "Now this is interesting..." or "What's fascinating here is..."
- End with a natural conclusion and call-to-action
- Target 3-5 minutes of speaking time (roughly 500-800 words)
- Make it sound natural and spontaneous, not scripted`
          },
          {
            role: 'user',
            content: `Create a podcast script based on this article:

Title: ${title}
Content: ${content}

Transform this into an engaging single-host podcast episode. Remember to start with "Hey everyone welcome to the podcast, in this podcast we are gonna talk about..." and make it sound natural and conversational.`
          }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.json();
      console.error('OpenAI API Error:', errorData);
      return NextResponse.json(
        { error: 'Failed to generate podcast script. Please check the server configuration.' },
        { status: 500 }
      );
    }

    const openAIData = await openAIResponse.json();
    const script = openAIData.choices[0]?.message?.content || '';

    if (!script) {
      return NextResponse.json(
        { error: 'No script generated' },
        { status: 500 }
      );
    }

    // Clean up the script
    const cleanedScript = script
      .replace(/^\"|\"$/g, '') // Remove quotes at start/end
      .replace(/\\n/g, '\n') // Convert literal \n to actual line breaks
      .trim();

    return NextResponse.json({
      script: cleanedScript,
      wordCount: cleanedScript.split(' ').length,
      estimatedDuration: Math.ceil(cleanedScript.split(' ').length / 150), // Rough estimate: 150 words per minute
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error generating script:', error);
    return NextResponse.json(
      { error: 'Failed to generate podcast script. Please check the server configuration.' },
      { status: 500 }
    );
  }
} 