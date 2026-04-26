"use client";

import { useMemo, useState } from "react";
import { diagnosisOptions, experienceOptions } from "@/lib/formOptions";

const emptyForm = {
  name: "",
  experience: "",
  rawQuestion: "",
  scenario: "",
  finalQuestion: ""
};

export default function HomePage() {
  const [form, setForm] = useState(emptyForm);
  const [diagnosis, setDiagnosis] = useState([]);
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const diagnosisCount = useMemo(() => diagnosis.length, [diagnosis]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function toggleDiagnosis(item) {
    setDiagnosis((current) => {
      if (current.includes(item)) {
        return current.filter((selected) => selected !== item);
      }

      if (current.length >= 3) {
        setStatus({
          type: "error",
          message: "Choose up to 3 self-diagnosis items."
        });
        return current;
      }

      setStatus({ type: "idle", message: "" });
      return [...current, item];
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: "idle", message: "" });

    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: form.name,
          experience: form.experience,
          diagnosis,
          rawQuestion: form.rawQuestion,
          scenario: form.scenario,
          finalQuestion: form.finalQuestion
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Submission failed.");
      }

      setForm(emptyForm);
      setDiagnosis([]);
      setStatus({
        type: "success",
        message: "Submitted. Your Tuesday training question is collected."
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Something went wrong. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="page-shell">
      <section className="hero-block" aria-labelledby="page-title">
        <p className="eyebrow">Tuesday BP Training</p>
        <h1 id="page-title">BP Training Question Collector</h1>
        <p className="intro-copy">
          Turn one fuzzy debate problem into one precise question.
        </p>
      </section>

      <form className="surface-card survey-form" onSubmit={handleSubmit}>
        <div className="field-grid two-column">
          <label className="field">
            <span>Name</span>
            <input
              name="name"
              required
              type="text"
              value={form.name}
              onChange={updateField}
              autoComplete="name"
              placeholder="Your name"
            />
          </label>

          <label className="field">
            <span>BP Experience</span>
            <select
              name="experience"
              required
              value={form.experience}
              onChange={updateField}
            >
              <option value="" disabled>
                Choose one
              </option>
              {experienceOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>

        <fieldset className="field diagnosis-field">
          <div className="field-row">
            <legend>Self-diagnosis</legend>
            <span>{diagnosisCount}/3</span>
          </div>
          <div className="checkbox-grid">
            {diagnosisOptions.map((item) => {
              const checked = diagnosis.includes(item);
              const disabled = !checked && diagnosisCount >= 3;

              return (
                <label
                  className={checked ? "check-option checked" : "check-option"}
                  key={item}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={disabled}
                    onChange={() => toggleDiagnosis(item)}
                  />
                  <span>{item}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <label className="field">
          <span>Raw question</span>
          <textarea
            name="rawQuestion"
            required
            value={form.rawQuestion}
            onChange={updateField}
            placeholder="Example: I don't know how to make an extension."
            rows={3}
          />
        </label>

        <label className="field">
          <span>When does this problem happen?</span>
          <textarea
            name="scenario"
            value={form.scenario}
            onChange={updateField}
            placeholder="Example: When OG has already said the obvious arguments, I don't know what CG can still add."
            rows={3}
          />
        </label>

        <label className="field">
          <span>Final precise question</span>
          <textarea
            name="finalQuestion"
            required
            value={form.finalQuestion}
            onChange={updateField}
            placeholder="Example: How can I tell whether a CG extension is independent enough instead of just adding details to OG?"
            rows={3}
          />
        </label>

        <div className="submit-row">
          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit question"}
          </button>
        </div>

        {status.message ? (
          <p className={`form-message ${status.type}`} role="status">
            {status.message}
          </p>
        ) : null}
      </form>
    </main>
  );
}
