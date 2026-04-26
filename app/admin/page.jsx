import Link from "next/link";
import AdminResponses from "./AdminResponses";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

async function getResponses() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("bp_training_responses")
      .select(
        "id,name,experience,diagnosis,raw_question,scenario,final_question,created_at"
      )
      .order("created_at", { ascending: false });

    if (error) {
      return { responses: [], error: error.message };
    }

    return { responses: data || [], error: "" };
  } catch (error) {
    return {
      responses: [],
      error: error.message || "Unable to load responses."
    };
  }
}

export default async function AdminPage() {
  const { responses, error } = await getResponses();

  return (
    <main className="page-shell admin-page">
      <Link className="back-link" href="/">
        Back to survey
      </Link>

      {error ? (
        <section className="surface-card setup-card">
          <p className="eyebrow">Setup needed</p>
          <h1>Admin responses could not load.</h1>
          <p>{error}</p>
          <p>
            Check your Supabase environment variables and confirm the
            bp_training_responses table exists.
          </p>
        </section>
      ) : (
        <AdminResponses responses={responses} />
      )}
    </main>
  );
}
