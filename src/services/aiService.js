// src/services/aiService.js
// AI-powered floor plan generation service

const SYSTEM_PROMPT = `You are an expert architect and interior designer AI that generates floor plans. 
When given a description, you create a detailed floor plan with walls, doors, windows, and furniture.

You MUST respond with ONLY valid JSON (no markdown, no explanations) in this exact format:
{
  "name": "Plan Name",
  "walls": [
    { "x1": number, "y1": number, "x2": number, "y2": number }
  ],
  "doors": [
    { "wallIndex": number, "position": number (0-1 along wall), "width": number }
  ],
  "windows": [
    { "wallIndex": number, "position": number (0-1 along wall), "width": number }
  ],
  "furniture": [
    { "type": string, "x": number, "y": number, "rotation": number (radians) }
  ]
}

RULES:
1. Use a coordinate system where 1 unit = 1 meter
2. Center the design around (0, 0)
3. Typical room dimensions: bedroom 3-4m, living room 4-6m, bathroom 2-3m, kitchen 3-4m
4. Standard wall thickness is 0.15m (handled automatically)
5. Connect walls at corners to form closed rooms
6. Place doors in walls (wallIndex references the wall array index)
7. Position is 0-1 where 0.5 means center of wall
8. Door width typically 0.9m, window width typically 1.0-1.5m

Available furniture types:
- Living: sofa, armchair, coffeeTable, tvStand, bookshelf
- Bedroom: bedSingle, bedDouble, bedKing, wardrobe, dresser, nightstand
- Dining: diningTable, diningTableRound, chair
- Kitchen: stove, refrigerator, sink, kitchenIsland
- Bathroom: toilet, bathtub, shower, vanity
- Office: desk, officeChair, filingCabinet
- Decor: plant, rug

Create realistic, livable floor plans with proper room proportions and furniture placement.`;

// Parse AI response and convert to app format
function parseAIResponse(response, settings) {
  try {
    // Try to extract JSON from the response
    let jsonStr = response;
    
    // Remove markdown code blocks if present
    const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }
    
    const data = JSON.parse(jsonStr.trim());
    const objects = [];
    
    // Convert walls
    if (data.walls && Array.isArray(data.walls)) {
      data.walls.forEach((wall, i) => {
        objects.push({
          id: `wall-${Date.now()}-${i}`,
          type: "wall",
          props: {
            x1: wall.x1,
            y1: wall.y1,
            x2: wall.x2,
            y2: wall.y2,
            height: settings.defaultWallHeight || 3,
            thickness: settings.defaultWallThickness || 0.15,
          },
        });
      });
    }
    
    // Convert doors
    if (data.doors && Array.isArray(data.doors)) {
      data.doors.forEach((door, i) => {
        const wallIndex = door.wallIndex;
        if (wallIndex >= 0 && wallIndex < (data.walls?.length || 0)) {
          const wall = data.walls[wallIndex];
          const t = door.position || 0.5;
          const x = wall.x1 + (wall.x2 - wall.x1) * t;
          const y = wall.y1 + (wall.y2 - wall.y1) * t;
          const angle = Math.atan2(wall.y2 - wall.y1, wall.x2 - wall.x1);
          
          objects.push({
            id: `door-${Date.now()}-${i}`,
            type: "door",
            props: {
              x,
              y,
              width: door.width || 0.9,
              height: 2.1,
              angle,
              wallId: `wall-${Date.now()}-${wallIndex}`,
            },
          });
        }
      });
    }
    
    // Convert windows
    if (data.windows && Array.isArray(data.windows)) {
      data.windows.forEach((window, i) => {
        const wallIndex = window.wallIndex;
        if (wallIndex >= 0 && wallIndex < (data.walls?.length || 0)) {
          const wall = data.walls[wallIndex];
          const t = window.position || 0.5;
          const x = wall.x1 + (wall.x2 - wall.x1) * t;
          const y = wall.y1 + (wall.y2 - wall.y1) * t;
          const angle = Math.atan2(wall.y2 - wall.y1, wall.x2 - wall.x1);
          
          objects.push({
            id: `window-${Date.now()}-${i}`,
            type: "window",
            props: {
              x,
              y,
              width: window.width || 1.0,
              height: 1.2,
              sillHeight: 0.9,
              angle,
              wallId: `wall-${Date.now()}-${wallIndex}`,
            },
          });
        }
      });
    }
    
    // Convert furniture
    if (data.furniture && Array.isArray(data.furniture)) {
      data.furniture.forEach((item, i) => {
        objects.push({
          id: `furniture-${Date.now()}-${i}`,
          type: "furniture",
          props: {
            furnitureType: item.type,
            position: [item.x, item.y],
            rotation: item.rotation || 0,
          },
        });
      });
    }
    
    return {
      success: true,
      name: data.name || "AI Generated Plan",
      objects,
    };
  } catch (error) {
    console.error("Failed to parse AI response:", error);
    console.error("Raw response:", response);
    return {
      success: false,
      error: "Failed to parse AI response. Please try again.",
    };
  }
}

// Helper function to delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Generate floor plan using Groq API (FREE with generous limits)
export async function generateWithGroq(prompt, apiKey, settings) {
  if (!apiKey) {
    return { success: false, error: "Groq API key is required. Get free key at console.groq.com" };
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Generate a floor plan for: ${prompt}` },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.error?.message || `API error: ${response.status}`,
      };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return { success: false, error: "No response from Groq" };
    }

    return parseAIResponse(content, settings);
  } catch (error) {
    console.error("Groq API error:", error);
    return { success: false, error: error.message };
  }
}

// Generate floor plan using Google Gemini API
export async function generateWithGemini(prompt, apiKey, settings, retryCount = 0) {
  if (!apiKey) {
    return { success: false, error: "Google Gemini API key is required" };
  }

  const MAX_RETRIES = 3;
  const model = "gemini-2.0-flash";

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `${SYSTEM_PROMPT}\n\nGenerate a floor plan for: ${prompt}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 4000,
          },
        }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!content) {
        return { success: false, error: "No response from Gemini" };
      }

      return parseAIResponse(content, settings);
    } else {
      const error = await response.json();
      
      // Handle rate limiting (429) with retry
      if (response.status === 429 && retryCount < MAX_RETRIES) {
        // Extract retry delay from response or use default
        const retryDelay = error.error?.details?.find(d => d.retryDelay)?.retryDelay;
        const waitTime = retryDelay ? parseInt(retryDelay) * 1000 : (retryCount + 1) * 7000;
        
        console.log(`Rate limited. Retrying in ${waitTime/1000} seconds... (attempt ${retryCount + 1}/${MAX_RETRIES})`);
        await delay(waitTime);
        
        return generateWithGemini(prompt, apiKey, settings, retryCount + 1);
      }
      
      // User-friendly error messages
      if (response.status === 429) {
        return { 
          success: false, 
          error: "Rate limit exceeded. Please wait a minute and try again, or upgrade your Gemini API plan." 
        };
      }
      
      return {
        success: false,
        error: error.error?.message || `API error: ${response.status}`,
      };
    }
  } catch (error) {
    console.error("Gemini API error:", error);
    return { success: false, error: error.message };
  }
}

// Generate floor plan using OpenAI API
export async function generateWithOpenAI(prompt, apiKey, settings) {
  if (!apiKey) {
    return { success: false, error: "OpenAI API key is required" };
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Generate a floor plan for: ${prompt}` },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { 
        success: false, 
        error: error.error?.message || `API error: ${response.status}` 
      };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      return { success: false, error: "No response from AI" };
    }

    return parseAIResponse(content, settings);
  } catch (error) {
    console.error("OpenAI API error:", error);
    return { success: false, error: error.message };
  }
}

// Generate floor plan using Anthropic API (Claude)
export async function generateWithAnthropic(prompt, apiKey, settings) {
  if (!apiKey) {
    return { success: false, error: "Anthropic API key is required" };
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        system: SYSTEM_PROMPT,
        messages: [
          { role: "user", content: `Generate a floor plan for: ${prompt}` },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { 
        success: false, 
        error: error.error?.message || `API error: ${response.status}` 
      };
    }

    const data = await response.json();
    const content = data.content?.[0]?.text;
    
    if (!content) {
      return { success: false, error: "No response from AI" };
    }

    return parseAIResponse(content, settings);
  } catch (error) {
    console.error("Anthropic API error:", error);
    return { success: false, error: error.message };
  }
}

// Generate using local/custom endpoint (e.g., Ollama, LM Studio)
export async function generateWithLocal(prompt, endpoint, model, settings) {
  if (!endpoint) {
    return { success: false, error: "Local endpoint URL is required" };
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model || "llama2",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Generate a floor plan for: ${prompt}` },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      return { success: false, error: `Local API error: ${response.status}` };
    }

    const data = await response.json();
    const content = data.message?.content || data.choices?.[0]?.message?.content;
    
    if (!content) {
      return { success: false, error: "No response from local AI" };
    }

    return parseAIResponse(content, settings);
  } catch (error) {
    console.error("Local API error:", error);
    return { success: false, error: error.message };
  }
}

// Main generate function that routes to the appropriate provider
export async function generateFloorPlan(prompt, config, settings) {
  const { provider, groqKey, geminiKey, openaiKey, anthropicKey, localEndpoint, localModel } = config;

  switch (provider) {
    case "groq":
      return generateWithGroq(prompt, groqKey, settings);
    case "gemini":
      return generateWithGemini(prompt, geminiKey, settings);
    case "openai":
      return generateWithOpenAI(prompt, openaiKey, settings);
    case "anthropic":
      return generateWithAnthropic(prompt, anthropicKey, settings);
    case "local":
      return generateWithLocal(prompt, localEndpoint, localModel, settings);
    default:
      return { success: false, error: "Invalid AI provider" };
  }
}

// Example prompts for inspiration
export const EXAMPLE_PROMPTS = [
  "Modern studio apartment with open kitchen and sleeping area",
  "2 bedroom apartment with living room and balcony",
  "3 bedroom family home with kitchen, dining, and 2 bathrooms",
  "Small office space with reception, 2 offices, and meeting room",
  "Master bedroom suite with walk-in closet and ensuite bathroom",
  "Open concept living and dining area with kitchen island",
  "Cozy 1 bedroom cottage with living room and kitchen",
  "L-shaped living room with home office corner",
];

export default generateFloorPlan;
