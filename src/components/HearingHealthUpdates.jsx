import React from "react";
import hearingHealthUpdates from "../data/hearingHealthUpdates.json";

function formatDate(value) {
  if (!value) {
    return "Updating soon";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function HearingHealthUpdates() {
  const items = hearingHealthUpdates.items?.slice(0, 4) ?? [];

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="updates-section">
      <div className="panel">
        <div className="panel-heading">
          <p className="eyebrow">Hearing-health updates</p>
          <h2>Recent tinnitus and hearing-health updates</h2>
          <p className="muted-text">
            A mix of fresh PubMed research and MedlinePlus patient-friendly
            reading, refreshed during site build so this section stays current
            without slowing down the listening experience.
          </p>
        </div>

        <div className="updates-grid">
          {items.map((item) => (
            <article className="update-card" key={item.id}>
              <div className="update-card-meta">
                <span className="tag">{item.type}</span>
                <span className="muted-text">{formatDate(item.publishedAt)}</span>
              </div>
              <h3>{item.title}</h3>
              <p>{item.summary}</p>
              <p className="muted-text">{item.sourceDetail}</p>
              <a
                className="text-link"
                href={item.link}
                rel="noreferrer"
                target="_blank"
              >
                {item.cta || `Read from ${item.source}`}
              </a>
            </article>
          ))}
        </div>

        <p className="muted-text updates-footnote">
          Last refreshed {formatDate(hearingHealthUpdates.updatedAt)}.
        </p>
      </div>
    </section>
  );
}
