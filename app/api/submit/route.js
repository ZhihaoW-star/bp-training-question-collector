import { NextResponse } from "next/server";
import { diagnosisOptions, experienceOptions } from "@/lib/formOptions";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const allowedExperiences = new Set(experienceOptions);
const allowedDiagnosis = new Set(diagnosisOptions);

function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request) {
  let body;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const name = cleanText(body.name);
  const experience = cleanText(body.experience);
  const rawQuestion = cleanText(body.rawQuestion);
  const scenario = cleanText(body.scenario);
  const finalQuestion = cleanText(body.finalQuestion);
  const diagnosis = Array.isArray(body.diagnosis)
    ? body.diagnosis.map(cleanText).filter(Boolean)
    : [];

  if (!name || !experience || !rawQuestion || !finalQuestion) {
    return NextResponse.json(
      { error: "Name, BP experience, raw question, and final precise question are required." },
      { status: 400 }
    );
  }

  if (!allowedExperiences.has(experience)) {
    return NextResponse.json(
      { error: "Please choose a valid BP experience option." },
      { status: 400 }
    );
  }

  if (diagnosis.length > 3) {
    return NextResponse.json(
      { error: "Self-diagnosis can include up to 3 items." },
      { status: 400 }
    );
  }

  if (diagnosis.some((item) => !allowedDiagnosis.has(item))) {
    return NextResponse.json(
      { error: "Please choose valid self-diagnosis items." },
      { status: 400 }
    );
  }

  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("bp_training_responses").insert({
      name,
      experience,
      diagnosis,
      raw_question: rawQuestion,
      scenario: scenario || null,
      final_question: finalQuestion
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Server configuration error." },
      { status: 500 }
    );
  }
}
