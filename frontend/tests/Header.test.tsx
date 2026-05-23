import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Header from "@/components/Header";

describe("Header", () => {
  it("renders the app title and subtitle", () => {
    render(<Header />);
    expect(screen.getByText("Studio Production Pipeline")).toBeInTheDocument();
    expect(screen.getByText("Gestor de producción de contenido")).toBeInTheDocument();
  });

  it("shows the backend status indicator", () => {
    render(<Header />);
    expect(screen.getByText("Backend activo")).toBeInTheDocument();
  });

  it("renders the logo badge", () => {
    render(<Header />);
    expect(screen.getByText("S")).toBeInTheDocument();
  });
});
