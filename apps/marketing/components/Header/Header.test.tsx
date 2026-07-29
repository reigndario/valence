import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Header from "./Header";

describe("Header product tabs", () => {
  it("renders Artemis, Scout, and Foil as always-visible top-level links", () => {
    render(<Header />);

    expect(screen.getByRole("link", { name: "Artemis" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Scout" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Foil" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "$0.99" })).toBeInTheDocument();
  });
});

describe("Header hamburger menu", () => {
  it("opens the nav menu and expands/collapses the Company accordion", async () => {
    const user = userEvent.setup();
    render(<Header />);

    expect(screen.queryByTestId("nav-menu")).not.toBeInTheDocument();

    await user.click(screen.getByTestId("menu-toggle"));
    expect(screen.getByTestId("nav-menu")).toBeInTheDocument();

    const toggle = screen.getByTestId("menu-accordion-toggle-0");
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByTestId("menu-accordion-panel-0")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "About" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Security Services" })).toBeInTheDocument();

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByTestId("menu-accordion-panel-0")).not.toBeInTheDocument();
  });

  it("includes Docs as a plain link in the menu", async () => {
    const user = userEvent.setup();
    render(<Header />);

    await user.click(screen.getByTestId("menu-toggle"));
    expect(screen.getByRole("link", { name: "Docs" })).toBeInTheDocument();
  });

  it("closes the menu when the toggle is clicked again", async () => {
    const user = userEvent.setup();
    render(<Header />);

    await user.click(screen.getByTestId("menu-toggle"));
    expect(screen.getByTestId("nav-menu")).toBeInTheDocument();

    await user.click(screen.getByTestId("menu-toggle"));
    expect(screen.queryByTestId("nav-menu")).not.toBeInTheDocument();
  });
});
