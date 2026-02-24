import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { InstallPrompt } from "@/components/InstallPrompt";

function fireInstallPrompt() {
  const event = Object.assign(new Event("beforeinstallprompt"), {
    preventDefault: () => {},
    prompt: () => Promise.resolve(),
    userChoice: Promise.resolve({ outcome: "dismissed" as const }),
  });
  act(() => {
    window.dispatchEvent(event);
  });
}

describe("InstallPrompt", () => {
  it("renders nothing before beforeinstallprompt event", () => {
    const { container } = render(<InstallPrompt />);
    expect(container.firstChild).toBeNull();
  });

  it("shows banner after beforeinstallprompt event fires", () => {
    render(<InstallPrompt />);
    fireInstallPrompt();
    expect(screen.getByText(/Add/)).toBeInTheDocument();
    expect(screen.getByText("PredictX", { exact: false })).toBeInTheDocument();
  });

  it("shows Install and dismiss buttons", () => {
    render(<InstallPrompt />);
    fireInstallPrompt();
    expect(screen.getByText("Install")).toBeInTheDocument();
    expect(screen.getByLabelText("Dismiss install prompt")).toBeInTheDocument();
  });

  it("hides banner and sets localStorage on dismiss", () => {
    render(<InstallPrompt />);
    fireInstallPrompt();
    fireEvent.click(screen.getByLabelText("Dismiss install prompt"));
    expect(screen.queryByText("Install")).toBeNull();
    expect(localStorage.getItem("pwa-install-dismissed")).toBe("1");
  });

  it("does not show banner when already dismissed in localStorage", () => {
    localStorage.setItem("pwa-install-dismissed", "1");
    render(<InstallPrompt />);
    fireInstallPrompt();
    expect(screen.queryByText("Install")).toBeNull();
  });
});
