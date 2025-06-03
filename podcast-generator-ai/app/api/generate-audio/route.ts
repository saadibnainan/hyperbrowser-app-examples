import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { script } = await request.json();

    if (!script) {
      return NextResponse.json({ error: 'Script is required' }, { status: 400 });
    }

    const elevenlabsApiKey = process.env.ELEVENLABS_API_KEY;
    if (!elevenlabsApiKey) {
      return NextResponse.json({ error: 'ElevenLabs API key not configured' }, { status: 500 });
    }

    // ElevenLabs API configuration
    const VOICE_ID = 'pNInz6obpgDQGcFmaJgB'; // Default to Adam voice

    // Generate audio using ElevenLabs TTS
    const elevenlabsResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': elevenlabsApiKey,
        },
        body: JSON.stringify({
          text: script,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
            style: 0.0,
            use_speaker_boost: true
          }
        }),
      }
    );

    if (!elevenlabsResponse.ok) {
      const errorText = await elevenlabsResponse.text();
      console.error('ElevenLabs API Error:', errorText);
      return NextResponse.json(
        { error: 'Failed to generate audio. Please check the server configuration.' },
        { status: 500 }
      );
    }

    // Get the audio buffer
    const audioBuffer = await elevenlabsResponse.arrayBuffer();
    
    // Convert to base64 for easier handling
    const audioBase64 = Buffer.from(audioBuffer).toString('base64');
    const audioDataUrl = `data:audio/mpeg;base64,${audioBase64}`;

    return NextResponse.json({
      audioUrl: audioDataUrl,
      audioSize: audioBuffer.byteLength,
      generatedAt: new Date().toISOString(),
      format: 'mp3'
    });

  } catch (error) {
    console.error('Error generating audio:', error);
    return NextResponse.json(
      { error: 'Failed to generate audio. Please check the server configuration.' },
      { status: 500 }
    );
  }
} 