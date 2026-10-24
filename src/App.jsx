import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import CatalogPage from "./CatalogPage.jsx";
import NamePage from "./NamePage.jsx";
import { translations } from "./i18n.js";

function AiSearch({ text }) {
  const [prompt, setPrompt] = useState("");
  const [searchMessage, setSearchMessage] = useState("");

  return (
    <section className="ai-search" aria-labelledby="ai-search-heading">
      <h2 className="ai-search-heading" id="ai-search-heading">
        {text.searchHeading}
      </h2>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (prompt.trim()) setSearchMessage(text.unavailable);
        }}
      >
        <textarea
          id="name-prompt"
          className="prompt-input"
          placeholder={text.promptPlaceholder}
          rows={3}
          value={prompt}
          onChange={(event) => {
            setPrompt(event.target.value);
            setSearchMessage("");
          }}
        />

        <div className="prompt-actions">
          <div className="prompt-examples">
            <span className="examples-label">{text.examplesLabel}</span>
            <div className="example-list">
              {text.examples.slice(0, 3).map((example) => (
                <button
                  className="example-button"
                  key={example}
                  type="button"
                  onClick={() => {
                    setPrompt(example);
                    setSearchMessage("");
                  }}
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
          <button className="submit-button" type="submit">
            {text.submit}
            <span className="submit-arrow" aria-hidden="true">
              →
            </span>
          </button>
        </div>
        <p className="search-message" role="status">
          {searchMessage}
        </p>
      </form>
    </section>
  );
}

function AppContent() {
  const [language, setLanguage] = useState("kk");
  const text = translations[language];

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = text.documentTitle;
  }, [language, text.documentTitle]);

  return (
    <main className="page">
      <header className="site-header">
        <a className="brand" href="/" aria-label={text.homeLabel}>
          <img className="brand-mark" src="/favicon.png" alt="" aria-hidden="true" />
          <span>{text.brand}</span>
        </a>
        <div className="language-switch" role="group" aria-label={text.languageSwitchLabel}>
          <button
            className={`language-button${language === "kk" ? " is-active" : ""}`}
            type="button"
            aria-pressed={language === "kk"}
            onClick={() => setLanguage("kk")}
          >
            Қаз
          </button>
          <button
            className={`language-button${language === "ru" ? " is-active" : ""}`}
            type="button"
            aria-pressed={language === "ru"}
            onClick={() => setLanguage("ru")}
          >
            Рус
          </button>
        </div>
      </header>

      <section className="hero" aria-labelledby="page-title">
        <p className="eyebrow">{text.eyebrow}</p>
        <h1 id="page-title">{text.title}</h1>
        <p className="hero-title">{text.subtitle}</p>
      </section>

      <div className="discovery">
        <Routes>
          <Route
            path="/"
            element={
              <>
                <AiSearch text={text} />
                <CatalogPage language={language} text={text} />
              </>
            }
          />
          <Route
            path="/name/:id"
            element={<NamePage text={text} language={language} />}
          />
          <Route
            path="*"
            element={<NamePage text={text} language={language} />}
          />
        </Routes>
      </div>

      <footer className="site-footer">
        <span>{text.brand}</span>
        <span>{text.footer}</span>
      </footer>
    </main>
  );
}

function App() {
  return <AppContent />;
}

export default App;
