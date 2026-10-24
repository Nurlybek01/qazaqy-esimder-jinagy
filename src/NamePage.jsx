import React from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import names from "./data/names.json";
import { nameFields } from "./nameFields.js";

function localizedValue(value, language) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value[language] ?? value.kk ?? value.ru ?? "";
  }
  return value;
}

function hasContent(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.some(hasContent);
  return true;
}

function safeHref(value) {
  if (typeof value !== "string") return null;
  if (value.startsWith("/") && !value.startsWith("//")) return value;

  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

function renderFieldValue(field, value, language, text) {
  if (field.key === "gender") {
    if (!hasContent(value)) return null;
    return value === "male" ? text.male : value === "female" ? text.female : value;
  }

  if (field.type === "list") {
    const items = Array.isArray(value) ? value : [value];
    const content = items.map((item) => localizedValue(item, language)).filter(hasContent);
    return content.length ? (
      <ul className="name-detail-list">
        {content.map((item, index) => (
          <li key={`${field.key}-${index}`}>{String(item)}</li>
        ))}
      </ul>
    ) : null;
  }

  if (field.type === "links") {
    const items = Array.isArray(value) ? value : [value];
    const links = items
      .filter((item) => item && typeof item === "object")
      .map((item) => ({
        href: safeHref(item.url ?? item.href),
        label: localizedValue(item.label ?? item.title ?? item.url, language),
      }))
      .filter((item) => item.href && hasContent(item.label));

    return links.length ? (
      <ul className="name-detail-list">
        {links.map((item, index) => (
          <li key={`${field.key}-${index}`}>
            <a href={item.href} rel="noreferrer" target="_blank">
              {String(item.label)}
            </a>
          </li>
        ))}
      </ul>
    ) : null;
  }

  const content = localizedValue(value, language);
  return hasContent(content) ? <p>{String(content)}</p> : null;
}

function NamePage({ text, language }) {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const name = names.find((item) => item.id === id);
  const search = searchParams.toString();
  const catalogPath = search ? `/?${search}` : "/";

  if (!name) {
    return (
      <section className="not-found-page" role="status">
        <h1>{text.nameNotFound}</h1>
        <Link className="name-back-link" to="/">
          {text.homeLink}
        </Link>
      </section>
    );
  }

  const visibleFields = nameFields
    .map((field) => ({
      ...field,
      value: renderFieldValue(field, name[field.key], language, text),
    }))
    .filter((field) => field.value !== null && field.value !== undefined);

  return (
    <section className="name-page" aria-labelledby="name-page-title">
      <Link className="name-back-link" to={catalogPath}>
        <span aria-hidden="true">←</span> {text.backToCatalog}
      </Link>
      <h1 id="name-page-title">{name.name}</h1>
      <dl className="name-details">
        {visibleFields.map((field) => (
          <div className="name-detail" key={field.key}>
            <dt>{text[field.title]}</dt>
            <dd>{field.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export default NamePage;
