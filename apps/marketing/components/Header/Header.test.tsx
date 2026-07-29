import { describe, expect, it } from "vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Header from "./Header";

describe("Header desktop dropdown", () => {
  it("opens on ArrowDown and moves focus to the first link", async () => {
    const user = userEvent.setup();
    render(<Header />);

    const productsButton = screen.getByRole("button", { name: /products/i });
    act(() => productsButton.focus());
    await user.keyboard("{ArrowDown}");

    const wardenLink = await screen.findByRole("link", { name: /warden/i });
    expect(wardenLink).toHaveFocus();
  });

  it("moves focus between links with ArrowDown/ArrowUp", async () => {
    const user = userEvent.setup();
    render(<Header />);

    const productsButton = screen.getByRole("button", { name: /products/i });
    act(() => productsButton.focus());
    await user.keyboard("{ArrowDown}");

    const wardenLink = await screen.findByRole("link", { name: /warden/i });
    expect(wardenLink).toHaveFocus();

    await user.keyboard("{ArrowDown}");
    const scoutLink = screen.getByRole("link", { name: /scout/i });
    expect(scoutLink).toHaveFocus();

    await user.keyboard("{ArrowUp}");
    expect(wardenLink).toHaveFocus();

    await user.keyboard("{ArrowUp}");
    expect(productsButton).toHaveFocus();
  });

  it("closes on Escape and returns focus to the trigger button", async () => {
    const user = userEvent.setup();
    render(<Header />);

    const productsButton = screen.getByRole("button", { name: /products/i });
    act(() => productsButton.focus());
    await user.keyboard("{ArrowDown}");

    await screen.findByRole("link", { name: /warden/i });
    await user.keyboard("{Escape}");

    expect(screen.queryByRole("link", { name: /warden/i })).not.toBeInTheDocument();
    expect(productsButton).toHaveFocus();
  });
});

describe("Header mobile accordion", () => {
  it("opens the mobile nav and expands/collapses an accordion item", async () => {
    const user = userEvent.setup();
    render(<Header />);

    await user.click(screen.getByTestId("mobile-toggle"));
    expect(screen.getByTestId("mobile-nav")).toBeInTheDocument();

    const toggle = screen.getByTestId("mobile-accordion-toggle-0");
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByTestId("mobile-accordion-panel-0")).toBeInTheDocument();

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByTestId("mobile-accordion-panel-0")).not.toBeInTheDocument();
  });
});
