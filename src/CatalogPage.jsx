import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import names from "./data/names.json";
import { formatNameCount } from "./i18n.js";

function CatalogPage({ language, text }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const catalogQuery = searchParams.get("q") ?? "";
  const genderParam = searchParams.get("gender");
  const gender = ["male", "female"].includes(genderParam) ? genderParam : "all";
  const letter = searchParams.get("letter") ?? "";
  const [pageSize, setPageSize] = useState(() =>
    window.matchMedia("(max-width: 700px)").matches ? 8 : 12,
  );
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const catalogLetters = useMemo(
    () =>
      [...new Set(names.map((item) => item.name[0].toLocaleUpperCase("kk")))].sort(
        (a, b) => a.localeCompare(b, "kk"),
      ),
    [],
  );
  const filteredNames = useMemo(() => {
    const normalizedQuery = catalogQuery.trim().toLocaleLowerCase("kk");

    return names.filter((item) => {
      const matchesQuery = item.name
        .toLocaleLowerCase("kk")
        .startsWith(normalizedQuery);
      const matchesGender = gender === "all" || item.gender === gender;
      const matchesLetter = !letter || item.name.startsWith(letter);

      return matchesQuery && matchesGender && matchesLetter;
    });
  }, [catalogQuery, gender, letter]);
  const hasCatalogFilter = Boolean(catalogQuery.trim() || letter || gender !== "all");
  const visibleNames = filteredNames.slice(0, visibleCount);

  useEffect(() => {
    const mobileQuery = window.matchMedia("(max-width: 700px)");
    const updatePageSize = () => setPageSize(mobileQuery.matches ? 8 : 12);
    mobileQuery.addEventListener("change", updatePageSize);

    return () => mobileQuery.removeEventListener("change", updatePageSize);
  }, []);

  useEffect(() => {
    setVisibleCount(pageSize);
  }, [pageSize, catalogQuery, gender, letter]);

  function updateFilter(key, value) {
    const nextParams = new URLSearchParams(searchParams);
    if (value) nextParams.set(key, value);
    else nextParams.delete(key);
    setSearchParams(nextParams);
  }

  const catalogSearch = searchParams.toString();
  const nameSearch = catalogSearch ? `?${catalogSearch}` : "";

  return (
    <>
      <div className="choice-divider" aria-hidden="true">
        <span>{text.chooseYourself}</span>
      </div>

      <section className="catalog" aria-label={text.catalogTitle}>
        <div
          className="catalog-letters"
          role="group"
          aria-label={text.letterLabel}
        >
          <button
            className={`catalog-filter${letter === "" ? " is-active" : ""}`}
            type="button"
            aria-pressed={letter === ""}
            onClick={() => updateFilter("letter", "")}
          >
            {text.allLetters}
          </button>
          {catalogLetters.map((catalogLetter) => (
            <button
              className={`catalog-filter letter-button${letter === catalogLetter ? " is-active" : ""}`}
              key={catalogLetter}
              type="button"
              aria-pressed={letter === catalogLetter}
              onClick={() => updateFilter("letter", catalogLetter)}
            >
              {catalogLetter}
            </button>
          ))}
        </div>

        <div className="catalog-controls">
          <label className="catalog-search">
            <span className="visually-hidden">{text.catalogSearchLabel}</span>
            <span className="catalog-search-icon" aria-hidden="true">
              ⌕
            </span>
            <input
              type="search"
              placeholder={text.catalogSearchPlaceholder}
              value={catalogQuery}
              onChange={(event) => updateFilter("q", event.target.value)}
            />
          </label>

          <div
            className="catalog-filter-group gender-filter"
            role="group"
            aria-label={text.genderLabel}
          >
            {[
              { value: "all", label: text.allGenders },
              { value: "male", label: text.male },
              { value: "female", label: text.female },
            ].map((option) => (
              <button
                className={`catalog-filter${gender === option.value ? " is-active" : ""}`}
                key={option.value}
                type="button"
                aria-pressed={gender === option.value}
                onClick={() =>
                  updateFilter("gender", option.value === "all" ? "" : option.value)
                }
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {hasCatalogFilter && (
          <p className="catalog-count">
            {formatNameCount(filteredNames.length, language, text)}
          </p>
        )}

        {!hasCatalogFilter ? (
          <p className="catalog-prompt">{text.chooseLetter}</p>
        ) : filteredNames.length === 0 ? (
          <p className="catalog-prompt" role="status">
            {text.noNames}
          </p>
        ) : (
          <>
            <ul className="catalog-grid">
              {visibleNames.map((item) => (
                <li key={item.id}>
                  <Link
                    className="catalog-card"
                    to={`/name/${encodeURIComponent(item.id)}${nameSearch}`}
                  >
                    {item.name && <h3>{item.name}</h3>}
                    {item.gender && (
                      <span className="catalog-gender">
                        {item.gender === "male"
                          ? text.male
                          : item.gender === "female"
                            ? text.female
                            : item.gender}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
            {visibleCount < filteredNames.length && (
              <button
                className="load-more"
                type="button"
                onClick={() => setVisibleCount((count) => count + pageSize)}
              >
                {text.showMore}
              </button>
            )}
          </>
        )}
      </section>
    </>
  );
}

export default CatalogPage;
