import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Radix UI Select doesn't work in jsdom — replace with a native <select>
vi.mock("@/components/ui/select", () => ({
  Select: ({
    value,
    onValueChange,
    children,
  }: {
    value: string;
    onValueChange: (v: string) => void;
    children: React.ReactNode;
  }) =>
    React.createElement(
      "select",
      {
        "data-testid": "category-select",
        value,
        onChange: (e: React.ChangeEvent<HTMLSelectElement>) =>
          onValueChange(e.target.value),
      },
      children
    ),
  SelectTrigger: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
  SelectValue: ({ placeholder }: { placeholder: string }) =>
    React.createElement("option", { value: "" }, placeholder),
  SelectContent: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
  SelectItem: ({
    value,
    children,
  }: {
    value: string;
    children: React.ReactNode;
  }) => React.createElement("option", { value }, children),
}));

import { MarketCreateForm } from "@/components/markets/MarketCreateForm";
import { toast } from "sonner";

const mockToast = vi.mocked(toast);

function fillRequiredFields() {
  fireEvent.change(screen.getByLabelText(/title/i), {
    target: { value: "Will BTC hit $200k?" },
  });
  fireEvent.change(screen.getByLabelText(/description/i), {
    target: { value: "A test description" },
  });
  fireEvent.change(screen.getByLabelText(/resolution criteria/i), {
    target: { value: "Resolved YES if BTC price exceeds $200k." },
  });
  const future = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
    .toISOString()
    .slice(0, 16);
  fireEvent.change(screen.getByLabelText(/close time/i), {
    target: { value: future },
  });
  fireEvent.change(screen.getByTestId("category-select"), {
    target: { value: "CRYPTO" },
  });
}

describe("MarketCreateForm", () => {
  it("renders without crashing", () => {
    render(<MarketCreateForm />);
    expect(
      screen.getByRole("button", { name: /submit for review/i })
    ).toBeInTheDocument();
  });

  it("shows validation errors when submitting an empty form", async () => {
    render(<MarketCreateForm />);
    fireEvent.submit(
      screen
        .getByRole("button", { name: /submit for review/i })
        .closest("form")!
    );
    await waitFor(() => {
      expect(screen.getByText("Title is required")).toBeInTheDocument();
      expect(screen.getByText("Description is required")).toBeInTheDocument();
      expect(
        screen.getByText("Resolution criteria is required")
      ).toBeInTheDocument();
    });
  });

  it("does not crash and shows an error toast when fetch throws a network error", async () => {
    vi.mocked(global.fetch).mockRejectedValueOnce(new Error("Network error"));

    render(<MarketCreateForm />);
    fillRequiredFields();

    fireEvent.submit(
      screen
        .getByRole("button", { name: /submit for review/i })
        .closest("form")!
    );

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith(
        "Something went wrong. Please try again."
      );
    });

    // Submit button should be re-enabled — not stuck in submitting state
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /submit for review/i })
      ).not.toBeDisabled();
    });
  });

  it("shows a success toast on successful submission", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ id: "m1" }), { status: 201 })
    );

    render(<MarketCreateForm />);
    fillRequiredFields();

    fireEvent.submit(
      screen
        .getByRole("button", { name: /submit for review/i })
        .closest("form")!
    );

    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith(
        "Market submitted for review"
      );
    });
  });

  it("shows an error toast when the API returns a non-ok response", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 })
    );

    render(<MarketCreateForm />);
    fillRequiredFields();

    fireEvent.submit(
      screen
        .getByRole("button", { name: /submit for review/i })
        .closest("form")!
    );

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith("Unauthorized");
    });
  });
});
