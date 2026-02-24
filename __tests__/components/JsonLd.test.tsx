import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { JsonLd } from "@/components/JsonLd";

describe("JsonLd", () => {
  it("renders a script tag with type application/ld+json", () => {
    render(<JsonLd data={{ "@type": "Event", name: "Test" }} />);
    const script = document.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
  });

  it("serialises the data object as JSON", () => {
    render(<JsonLd data={{ "@type": "Event", name: "Test Event" }} />);
    const script = document.querySelector('script[type="application/ld+json"]');
    const parsed = JSON.parse(script!.textContent!);
    expect(parsed).toEqual({ "@type": "Event", name: "Test Event" });
  });

  it("handles nested objects", () => {
    const data = { "@type": "FAQPage", mainEntity: [{ "@type": "Question", name: "Q1" }] };
    render(<JsonLd data={data} />);
    const script = document.querySelector('script[type="application/ld+json"]');
    expect(JSON.parse(script!.textContent!)).toEqual(data);
  });

  it("handles an empty object", () => {
    render(<JsonLd data={{}} />);
    const script = document.querySelector('script[type="application/ld+json"]');
    expect(JSON.parse(script!.textContent!)).toEqual({});
  });
});
