import { GoogleGenAI, Type, Schema } from "@google/genai";
import { KeywordData, StrategyResult, AnalysisResult, OnPageAudit, PlanTier, KeywordCluster, ContentBrief } from "../types";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to clean raw text output (remove markdown code blocks)
const cleanHtmlOutput = (text: string): string => {
  return text.replace(/```html/g, '').replace(/```/g, '').trim();
};

const cleanTextOutput = (text: string): string => {
  return text.replace(/```/g, '').trim();
};

// Helper to get real-world context about the domain using Google Search
const getDomainContext = async (domain: string, niche: string): Promise<string> => {
  if (!apiKey) return "";
  const model = "gemini-2.5-flash";
  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Search for the website "${domain}" and the niche "${niche}". 
      Summarize what this business actually does in 2-3 sentences. 
      Critically identify the specific product type (e.g. is it passive solar rooms, active PV panels, consulting?).
      Explain how it fits into the broader market (e.g. "Competes in solar market but offers sunrooms").
      `,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });
    return response.text || "No specific context found.";
  } catch (e) {
    console.warn("Search context failed, falling back to simulation", e);
    return "No external context available. Rely on internal knowledge.";
  }
};

// Helper to generate images
export const generateImage = async (prompt: string, aspectRatio: string = "16:9"): Promise<string | undefined> => {
  if (!apiKey) return undefined;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: { aspectRatio: aspectRatio as any }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return undefined;
  } catch (e) {
    console.error("Image generation failed", e);
    return undefined;
  }
};

export const analyzeKeywords = async (domain: string, niche: string): Promise<AnalysisResult> => {
  if (!apiKey) throw new Error("API Key is missing");

  const context = await getDomainContext(domain, niche);
  const model = "gemini-2.5-flash";
  
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      keywords: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            term: { type: Type.STRING },
            volume: { type: Type.NUMBER },
            difficulty: { type: Type.NUMBER },
            intent: { type: Type.STRING, enum: ["Informational", "Transactional", "Commercial", "Navigational"] },
            cpc: { type: Type.NUMBER }
          },
          required: ["term", "volume", "difficulty", "intent", "cpc"]
        }
      },
      clusters: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING },
            keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            competitorGap: { type: Type.STRING },
            opportunityScore: { type: Type.NUMBER }
          },
          required: ["topic", "keywords", "competitorGap", "opportunityScore"]
        }
      },
      audit: {
        type: Type.OBJECT,
        properties: {
          healthScore: { type: Type.NUMBER },
          detectedTitle: { type: Type.STRING },
          businessSummary: { type: Type.STRING },
          metaDescriptionStatus: { type: Type.STRING, enum: ["Optimized", "Missing", "Too Long", "Too Short"] },
          loadSpeedEstimate: { type: Type.STRING, enum: ["Fast", "Moderate", "Slow"] },
          contentGaps: { type: Type.ARRAY, items: { type: Type.STRING } },
          technicalIssues: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["healthScore", "detectedTitle", "businessSummary", "metaDescriptionStatus", "loadSpeedEstimate", "contentGaps", "technicalIssues"]
      }
    }
  };

  const prompt = `
    Analyze the domain "${domain}" focusing on the niche "${niche}".
    **REAL-WORLD CONTEXT:** ${context}
    
    1. Identify 20 non-branded long-tail keywords (3-6 words, no brand names).
    2. Group them into 4-5 clusters.
       - For each cluster, simulate a SERP analysis. Identify the "Competitor Gap" (what's missing on Page 1?).
    3. Infer site audit details (Title, Health, Gaps).
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.4, 
      }
    });

    const text = response.text;
    if (!text) throw new Error("No data generated");
    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};

export const generateStrategy = async (
    domain: string, 
    keywords: KeywordData[], 
    audit: OnPageAudit, 
    clusters: KeywordCluster[],
    planTier: PlanTier
): Promise<StrategyResult> => {
  if (!apiKey) throw new Error("API Key is missing");

  const clusterContext = clusters.map(c => `Topic: ${c.topic}. Gap: ${c.competitorGap}. Keywords: ${c.keywords.join(', ')}`).join('\n');
  const model = "gemini-2.5-flash";

  // Number of briefs to generate
  const count = planTier === 'Free' ? 6 : planTier === 'Pro' ? 12 : 30;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      briefs: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            contentType: { type: Type.STRING, enum: ["Article", "Thread", "LinkedIn"] },
            title: { type: Type.STRING },
            targetKeyword: { type: Type.STRING },
            clusterTopic: { type: Type.STRING },
            contentGapAddressed: { type: Type.STRING, description: "Specific weakness in competitor content this content solves" },
            primaryAudience: { type: Type.STRING },
            overview: { type: Type.STRING, description: "2-3 sentence summary of the angle" },
            structure: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Ordered list of sections/tweets/points" },
            keyPoints: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3-5 must-include facts or arguments" },
            competitiveAdvantage: { type: Type.STRING, description: "Why this piece will perform well" },
            searchIntentMatch: { type: Type.STRING, description: "How this satisfies the user's specific intent" },
            scheduledDate: { type: Type.STRING, description: "Day X" }
          },
          required: ["contentType", "title", "targetKeyword", "clusterTopic", "contentGapAddressed", "primaryAudience", "overview", "structure", "keyPoints", "competitiveAdvantage", "searchIntentMatch", "scheduledDate"]
        }
      }
    }
  };

  const prompt = `
    Create a **Mixed Content Strategy** for "${domain}".
    
    **Context**: ${audit.businessSummary}
    **Clusters & Gaps**:
    ${clusterContext}
    
    Task: Generate ${count} separate **Content Briefs**.
    
    **CRITICAL DISTRIBUTION**:
    - **Articles (40%)**: Long-form SEO, deep dives, "how-to".
    - **X Threads (30%)**: Punchy, contrarian, viral, "listicle".
    - **LinkedIn (30%)**: Professional, industry insight, thought leadership, case study style.
    
    **Directives**:
    - Spread them out over a schedule (Day 1, Day 2, etc.).
    - Ensure each brief explicitly targets a **Competitor Gap**.
    - For LinkedIn: Focus on business value, professional growth, or industry trends related to the keyword.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.7, 
      }
    });

    const text = response.text;
    if (!text) throw new Error("No strategy generated");
    
    return JSON.parse(text) as StrategyResult;
  } catch (error) {
    console.error("Gemini Strategy Error:", error);
    throw error;
  }
};

export const generateFullContent = async (brief: ContentBrief): Promise<{ html: string; imageUrl?: string }> => {
  if (!apiKey) throw new Error("API Key is missing");

  const model = "gemini-2.5-flash";
  const prompt = `
    You are an expert SEO copywriter. Write a full blog post based on this **Exact Brief**:
    
    **Title**: ${brief.title}
    **Target Keyword**: ${brief.targetKeyword}
    **Audience**: ${brief.primaryAudience}
    **Overview**: ${brief.overview}
    **Competitive Angle**: ${brief.competitiveAdvantage}
    
    **Required Outline**:
    ${brief.structure.map(s => `- ${s}`).join('\n')}
    
    **Key Points to Cover**:
    ${brief.keyPoints.map(p => `- ${p}`).join('\n')}
    
    **Formatting Rules**:
    - Return ONLY HTML. No markdown blocks.
    - Use <h2> for the main sections in the outline.
    - Use <h3> for subsections.
    - Use <ul>/<ol> lists where appropriate.
    - **Tone**: Authoritative, helpful, engaging.
    - **Length**: 1000-1500 words.
  `;

  const contentPromise = ai.models.generateContent({
    model,
    contents: prompt,
    config: { temperature: 0.7 }
  });

  const imagePrompt = `Editorial illustration for a business blog post titled "${brief.title}". 
  Context: ${brief.overview}. 
  Style: Modern, clean, high-quality digital art or photorealistic. No text.`;

  const imagePromise = generateImage(imagePrompt, "16:9");

  const [contentResponse, imageUrl] = await Promise.all([contentPromise, imagePromise]);

  const rawHtml = contentResponse.text || "<p>Failed to generate content.</p>";
  
  return {
    html: cleanHtmlOutput(rawHtml),
    imageUrl
  };
};

export const generateXThread = async (brief: ContentBrief): Promise<{ thread: string[]; imageUrl?: string }> => {
  if (!apiKey) throw new Error("API Key is missing");

  const model = "gemini-2.5-flash";
  const prompt = `
    You are a viral ghostwriter for X (formerly Twitter). 
    Write a high-engagement thread based on this content brief:
    
    **Topic**: ${brief.title}
    **Key Points**: ${brief.keyPoints.join(', ')}
    **Audience**: ${brief.primaryAudience}
    **Context**: ${brief.overview}
    
    **Requirements**:
    - **Format**: Return a JSON ARRAY of strings. Each string is one tweet.
    - **Tone**: Punchy, insight-rich, conversational. Avoid corporate jargon.
    - **Structure**:
      1. Hook (Tweet 1): Stop the scroll. State a contrarian view or a high-value promise.
      2. Body (Tweets 2-N): Break down the key points. One idea per tweet. Use whitespace.
      3. Conclusion/CTA (Last Tweet): Summarize and ask for a follow/retweet.
    - **Style**: Use formatting like bullet points, arrows (->), and short sentences.
  `;

  const threadPromise = ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      },
      temperature: 0.8
    }
  });

  const imagePrompt = `A high-impact, abstract or minimalist digital illustration suitable for a Twitter thread about: "${brief.title}". 
  Context: ${brief.overview}. 
  Style: Bold, high-contrast, modern, tech-forward. NO TEXT.`;

  const imagePromise = generateImage(imagePrompt, "1:1"); // Square for social

  const [threadResponse, imageUrl] = await Promise.all([threadPromise, imagePromise]);

  const text = threadResponse.text;
  let thread: string[] = ["Failed to generate thread."];
  if (text) {
     try {
       thread = JSON.parse(text) as string[];
     } catch(e) {
       console.error("Failed to parse thread JSON", e);
     }
  }

  return { thread, imageUrl };
};

export const generateLinkedInPost = async (brief: ContentBrief): Promise<{ post: string; imageUrl?: string }> => {
  if (!apiKey) throw new Error("API Key is missing");

  const model = "gemini-2.5-flash";
  const prompt = `
    You are a LinkedIn Top Voice ghostwriter. Write a professional, high-engagement post based on:
    
    **Topic**: ${brief.title}
    **Key Insights**: ${brief.keyPoints.join(', ')}
    **Audience**: ${brief.primaryAudience}
    
    **Style Guide**:
    - **Hook**: Start with a strong, professional hook or a personal anecdote related to the business context.
    - **Body**: Use short paragraphs. Use bullet points for readability.
    - **Tone**: Professional, insightful, "Thought Leader", encouraging.
    - **Formatting**: Use appropriate emojis (but don't overdo it).
    - **CTA**: End with a question to drive comments.
    - **Hashtags**: Add 3-5 relevant hashtags at the very bottom.
    - **Format**: Return a SINGLE string.
  `;

  const postPromise = ai.models.generateContent({
    model,
    contents: prompt,
    config: { temperature: 0.7 }
  });

  const imagePrompt = `Professional concept art for a LinkedIn post about "${brief.title}". 
  Style: Corporate memphis or sleek 3D render. Clean, business-oriented.
  Context: ${brief.overview}`;

  const imagePromise = generateImage(imagePrompt, "4:5"); // Vertical/Portrait for LinkedIn

  const [postResponse, imageUrl] = await Promise.all([postPromise, imagePromise]);

  return { 
    post: cleanTextOutput(postResponse.text || "Failed to generate post."), 
    imageUrl 
  };
};
