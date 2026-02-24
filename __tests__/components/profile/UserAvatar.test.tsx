import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { UserAvatar } from "@/components/profile/UserAvatar";

describe("UserAvatar", () => {
  it("renders the first two characters of username as initials", () => {
    render(<UserAvatar username="alice" />);
    expect(screen.getByText("AL")).toBeInTheDocument();
  });

  it("uppercases the initials", () => {
    render(<UserAvatar username="bob" />);
    expect(screen.getByText("BO")).toBeInTheDocument();
  });

  it("handles single-character username", () => {
    render(<UserAvatar username="x" />);
    expect(screen.getByText("X")).toBeInTheDocument();
  });

  it("applies sm size classes", () => {
    const { container } = render(<UserAvatar username="alice" size="sm" />);
    expect(container.firstChild).toHaveClass("w-8", "h-8");
  });

  it("applies md size classes by default", () => {
    const { container } = render(<UserAvatar username="alice" />);
    expect(container.firstChild).toHaveClass("w-10", "h-10");
  });

  it("applies lg size classes", () => {
    const { container } = render(<UserAvatar username="alice" size="lg" />);
    expect(container.firstChild).toHaveClass("w-16", "h-16");
  });

  it("produces the same hue for the same username", () => {
    const { container: c1 } = render(<UserAvatar username="testuser" />);
    const { container: c2 } = render(<UserAvatar username="testuser" />);
    const style1 = (c1.firstChild as HTMLElement).style.backgroundColor;
    const style2 = (c2.firstChild as HTMLElement).style.backgroundColor;
    expect(style1).toBe(style2);
  });

  it("produces different hues for different usernames", () => {
    const { container: c1 } = render(<UserAvatar username="alice" />);
    const { container: c2 } = render(<UserAvatar username="zzz999" />);
    const style1 = (c1.firstChild as HTMLElement).style.backgroundColor;
    const style2 = (c2.firstChild as HTMLElement).style.backgroundColor;
    // Very unlikely to be the same (different usernames → different hashes)
    expect(style1).not.toBe(style2);
  });
});
