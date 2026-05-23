import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import KanbanBoard from "@/components/KanbanBoard";
import type { Project } from "@/lib/api";

const projects: Project[] = [
  {
    id: "p1",
    title: "Idea Project",
    studio: "Cinefactory",
    status: "idea",
    created_at: "",
    updated_at: "",
    tasks_completed: 0,
    tasks_total: 1,
    assets_count: 0,
  },
  {
    id: "p2",
    title: "Prod Project",
    studio: "Cinexin",
    status: "production",
    created_at: "",
    updated_at: "",
    tasks_completed: 2,
    tasks_total: 5,
    assets_count: 3,
  },
  {
    id: "p3",
    title: "Another Prod",
    studio: "100 Sutton",
    status: "production",
    created_at: "",
    updated_at: "",
    tasks_completed: 1,
    tasks_total: 4,
    assets_count: 1,
  },
];

describe("KanbanBoard", () => {
  it("renders all columns", () => {
    render(<KanbanBoard projects={projects} />);
    // Query column headers by their parent heading/label context
    expect(screen.getAllByText("Idea").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Guion").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Producción").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Publicado").length).toBeGreaterThanOrEqual(1);
  });

  it("groups projects into the correct columns", () => {
    render(<KanbanBoard projects={projects} />);
    expect(screen.getByText("Idea Project")).toBeInTheDocument();
    expect(screen.getAllByText("Producción").length).toBeGreaterThanOrEqual(2);
  });

  it("shows the correct count badges", () => {
    render(<KanbanBoard projects={projects} />);
    const ideaBadge = screen.getByText("1");
    expect(ideaBadge).toBeInTheDocument();
  });

  it("handles empty projects gracefully", () => {
    render(<KanbanBoard projects={[]} />);
    expect(screen.getByText("Idea")).toBeInTheDocument();
    expect(screen.queryByText("Idea Project")).not.toBeInTheDocument();
  });
});
