import { Hyperbrowser } from "@hyperbrowser/sdk";
import { OpenAI } from "openai";

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return Response.json({ error: "URL is required" }, { status: 400 });
    }

    if (!process.env.HYPERBROWSER_API_KEY) {
      return Response.json({ error: "Hyperbrowser API key not configured" }, { status: 500 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return Response.json({ error: "OpenAI API key not configured" }, { status: 500 });
    }

    const hbClient = new Hyperbrowser({
      apiKey: process.env.HYPERBROWSER_API_KEY,
    });

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

          // Use Browser Use agent to analyze website
      const result = await hbClient.agents.browserUse.startAndWait({
        task: `Go to ${url} and analyze the UI/UX to identify why users might leave. Focus on visual analysis and actual observations:

1. Look at the homepage design and layout - describe what you see
2. Try clicking on navigation menu items and links - do they work?
3. Scroll through the page and observe the visual hierarchy
4. Try to complete basic user actions (contact form, sign up, etc.)
5. Look for confusing elements, broken links, or unclear messaging
6. Observe the overall design quality and professionalism

Report specific observations about:
- Visual design issues (layout, spacing, typography problems)
- Navigation problems (broken links, confusing menus)
- Content issues (unclear messaging, missing information)
- User flow problems (hard to find key actions)

Be descriptive about what you actually see and experience on the website.`,
      useVision: true,
      useVisionForPlanner: true,
      maxSteps: 12,
    });

    if (!result.data?.finalResult) {
      return Response.json({ error: "Failed to analyze website" }, { status: 500 });
    }

    // Log the actual Hyperbrowser analysis for debugging
    console.log("Hyperbrowser Analysis:", result.data.finalResult);

    // Get additional AI analysis from OpenAI
    const analysis = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a UX/UI expert. Based on the browser analysis provided, identify specific UI/UX issues that could cause users to leave the website. Focus on actual observations made during the browser testing.`
        },
        {
          role: "user",
          content: `Here are the browser analysis results for ${url}:

"${result.data.finalResult}"

Based on these observations, categorize the issues that could cause users to leave:

- **Critical Issues**: Major problems that would immediately frustrate users
- **UX Problems**: Navigation, layout, or design issues that hurt usability  
- **Performance Concerns**: Loading, responsiveness, or technical issues
- **Conversion Barriers**: Elements that prevent users from taking desired actions
- **Recommendations**: Specific actionable fixes for the identified problems

Extract insights from the actual observations made. If the analysis mentions working elements, don't categorize those as problems.

Format as JSON: {"criticalIssues": [], "uxProblems": [], "performanceConcerns": [], "conversionBarriers": [], "recommendations": []}`
        }
      ],
      temperature: 0.3,
    });

    let aiAnalysis;
    try {
      const rawContent = analysis.choices[0]?.message?.content || "{}";
      console.log("Raw AI response:", rawContent);
      
      // Try to extract JSON from the response if it's wrapped in text
      let jsonContent = rawContent;
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonContent = jsonMatch[0];
      }
      
      aiAnalysis = JSON.parse(jsonContent);
      console.log("Parsed AI analysis:", aiAnalysis);
    } catch (parseError) {
      console.error("JSON parsing failed:", parseError);
      console.log("Raw content that failed to parse:", analysis.choices[0]?.message?.content);
      
      aiAnalysis = {
        error: "Failed to parse AI analysis",
        rawAnalysis: analysis.choices[0]?.message?.content
      };
    }

    // Log analysis for debugging
    console.log("Hyperbrowser Analysis:", result.data.finalResult);

    return Response.json({
      url,
      hyperbrowserAnalysis: result.data.finalResult,
      aiAnalysis,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error("Analysis error:", error);
    return Response.json(
      { error: "Failed to analyze website", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}