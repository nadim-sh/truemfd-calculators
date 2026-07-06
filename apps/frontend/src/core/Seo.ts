type SeoOptions = {
  title: string;
  description: string;
  canonical: string;
};

export function applySeo({ title, description, canonical }: SeoOptions) {
  document.title = title;
  setMeta("description", description);
  setMeta("og:title", title, "property");
  setMeta("og:description", description, "property");
  setMeta("og:image", "https://truemfd-calculators-web.onrender.com/true-mfd-og.svg", "property");
  setLink("canonical", canonical);
  setJsonLd({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: title,
    description,
    url: canonical,
    applicationCategory: "FinanceApplication",
    publisher: {
      "@type": "Organization",
      name: "TrueMFD"
    }
  });
}

function setMeta(key: string, content: string, attr = "name") {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attr, key);
    document.head.appendChild(element);
  }
  element.content = content;
}

function setLink(rel: string, href: string) {
  let element = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement("link");
    element.rel = rel;
    document.head.appendChild(element);
  }
  element.href = href;
}

function setJsonLd(value: Record<string, unknown>) {
  const id = "truemfd-json-ld";
  let element = document.getElementById(id) as HTMLScriptElement | null;
  if (!element) {
    element = document.createElement("script");
    element.id = id;
    element.type = "application/ld+json";
    document.head.appendChild(element);
  }
  element.textContent = JSON.stringify(value);
}
