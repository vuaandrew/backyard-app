import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type PlantResult = {
  isPlant: boolean;
  speciesId: string | null;
  commonName: string | null;
  stage: string | null;
  confidence: number;
  estimatedAgeDays: number | null;
  estimatedDaysToHarvest: number | null;
  estimatedYield: number | null;
  health: "Healthy" | "Stressed" | "Unclear";
  notes: string;
};

export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          error: "OPENAI_API_KEY is missing.",
        },
        {
          status: 500,
        }
      );
    }

    const formData = await request.formData();

    const image = formData.get("image");

    if (!(image instanceof File)) {
      return NextResponse.json(
        {
          error: "No image was uploaded.",
        },
        {
          status: 400,
        }
      );
    }

    if (!image.type.startsWith("image/")) {
      return NextResponse.json(
        {
          error: "Uploaded file must be an image.",
        },
        {
          status: 400,
        }
      );
    }

    /*
      Keep the prototype reasonably small.

      Later we'll compress images on-device before
      uploading them to reduce cost and bandwidth.
    */
    const maxBytes = 8 * 1024 * 1024;

    if (image.size > maxBytes) {
      return NextResponse.json(
        {
          error: "Image is too large. Please use an image under 8 MB.",
        },
        {
          status: 400,
        }
      );
    }

    const bytes = Buffer.from(
      await image.arrayBuffer()
    );

    const base64 = bytes.toString("base64");

    const dataUrl =
      `data:${image.type};base64,${base64}`;

    const prompt = `
You are the plant-analysis system for a gardening game.

Analyze the photograph conservatively.

The currently supported species IDs are:

- tomato
- strawberry
- chilli
- carrot
- lettuce
- basil

Your goals:

1. Decide whether the image actually contains a plant.
2. Identify the plant only if visual evidence is strong enough.
3. Estimate its current growth stage.
4. Estimate approximate age in days when reasonable.
5. Estimate approximate days remaining until the next harvest.
6. Estimate likely harvest quantity only when reasonable.
7. Give a simple health estimate.

Important rules:

- Young seedlings often look extremely similar.
- Never pretend to know the species if the image is ambiguous.
- If species confidence is below about 70%, return speciesId null.
- If the plant is a very young seedling and uncertain, explain that the user should choose "I know what I planted".
- Do not diagnose disease with certainty from one image.
- Harvest timing and yield must be approximate.
- Return confidence as an integer from 0 to 100.

Use only these stage names when possible:

Seedling
Growing
Flowering
Fruiting
Mature
Ready to harvest
Root development
Leaf growth

Return ONLY JSON with exactly this shape:

{
  "isPlant": true,
  "speciesId": "tomato",
  "commonName": "Tomato",
  "stage": "Fruiting",
  "confidence": 91,
  "estimatedAgeDays": 70,
  "estimatedDaysToHarvest": 10,
  "estimatedYield": 8,
  "health": "Healthy",
  "notes": "Several developing tomatoes are visible."
}

Use null when a value cannot reasonably be estimated.
`;

    const response =
      await openai.responses.create({
        model: "gpt-5.6-luna",

        input: [
          {
            role: "user",

            content: [
              {
                type: "input_text",
                text: prompt,
              },

              {
                type: "input_image",
                image_url: dataUrl,
                detail: "auto",
              },
            ],
          },
        ],
      });

    const output =
      response.output_text.trim();

    let result: PlantResult;

    try {
      const cleaned = output
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```$/i, "")
        .trim();

      result = JSON.parse(cleaned);
    } catch {
      console.error(
        "Could not parse AI response:",
        output
      );

      return NextResponse.json(
        {
          error:
            "The AI returned an invalid result. Please try another photo.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error(
      "Plant identification error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Plant identification failed.",
      },
      {
        status: 500,
      }
    );
  }
}