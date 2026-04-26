"use client";

import { useMemo, useState } from "react";

function formatDate(value) {
  if (!value) return "Unknown";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function buildSummaryText(responses) {
  if (!responses.length) {
    return "No BP training responses yet.";
  }

  return responses
    .map((response, index) => {
      const diagnosis = response.diagnosis?.length
        ? response.diagnosis.join(", ")
        : "None selected";

      return [
        `#${index + 1} ${response.name}`,
        `Created: ${formatDate(response.created_at)}`,
        `BP experience: ${response.experience}`,
        `Self-diagnosis: ${diagnosis}`,
        `Raw question: ${response.raw_question}`,
        `Scenario: ${response.scenario || "Not provided"}`,
        `Final precise question: ${response.final_question}`
      ].join("\n");
    })
    .join("\n\n---\n\n");
}

export default function AdminResponses({ responses }) {
  const [copyStatus, setCopyStatus] = useState("");
  const summaryText = useMemo(() => buildSummaryText(responses), [responses]);

  async function copyAllResponses() {
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopyStatus("Copied.");
    } catch {
      setCopyStatus("Copy failed.");
    }
  }

  return (
    <div className="admin-stack">
      <div className="admin-toolbar">
        <div>
          <p className="eyebrow">Admin</p>
          <h1>BP Training Responses</h1>
        </div>
        <button className="secondary-button" type="button" onClick={copyAllResponses}>
          Copy all responses for ChatGPT summary
        </button>
      </div>

      {copyStatus ? (
        <p className="form-message success compact" role="status">
          {copyStatus}
        </p>
      ) : null}

      {responses.length ? (
        <div className="response-list">
          {responses.map((response) => (
            <article className="response-card" key={response.id}>
              <div className="response-topline">
                <div>
                  <h2>{response.name}</h2>
                  <p>{response.experience}</p>
                </div>
                <time dateTime={response.created_at}>
                  {formatDate(response.created_at)}
                </time>
              </div>

              <div className="tag-list" aria-label="Selected diagnosis items">
                {response.diagnosis?.length ? (
                  response.diagnosis.map((item) => <span key={item}>{item}</span>)
                ) : (
                  <span>None selected</span>
                )}
              </div>

              <dl className="response-details">
                <div>
                  <dt>Raw question</dt>
                  <dd>{response.raw_question}</dd>
                </div>
                <div>
                  <dt>Scenario</dt>
                  <dd>{response.scenario || "Not provided"}</dd>
                </div>
                <div>
                  <dt>Final precise question</dt>
                  <dd>{response.final_question}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      ) : (
        <div className="surface-card empty-state">
          <h2>No responses yet</h2>
          <p>Submissions will appear here in reverse chronological order.</p>
        </div>
      )}
    </div>
  );
}
