import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ProjectCard from "@/components/ProjectCard";
import type { Project } from "@/lib/api";

const baseProject: Project = {
  id: "proj-1",
  title: "Test Project",
  studio: "Cinefactory",
  description: "A sample description for testing.",
  status: "production",
  budget: 50000,
  deadline: "2026-06-15",
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
  tasks_completed: 3,
  tasks_total: 10,
  assets_count: 5,
};

describe("ProjectCard", () => {
  it("renders the project title and studio badge", () => {
    render(<ProjectCard project={baseProject} />);
    expect(screen.getByText("Test Project")).toBeInTheDocument();
    expect(screen.getByText("Cinefactory")).toBeInTheDocument();
  });

  it("shows the progress bar with correct percentage", () => {
    render(<ProjectCard project={baseProject} />);
    expect(screen.getByText("30%")).toBeInTheDocument();
  });

  it("displays budget and deadline when present", () => {
    render(<ProjectCard project={baseProject} />);
    expect(screen.getByText(/50\.000/)).toBeInTheDocument();
  });

  it("handles zero tasks total without crashing", () => {
    const project = { ...baseProject, tasks_total: 0, tasks_completed: 0 };
    render(<ProjectCard project={project} />);
    expect(screen.getByText("0%")).toBeInTheDocument();
  });

  it("shows tasks and assets summary", () => {
    render(<ProjectCard project={baseProject} />);
    expect(screen.getByText(/3\/10 tareas/)).toBeInTheDocument();
    expect(screen.getByText(/5 assets/)).toBeInTheDocument();
  });

  it("renders unknown studio with fallback color", () => {
    const project = { ...baseProject, studio: "Unknown Studio" };
    render(<ProjectCard project={project} />);
    expect(screen.getByText("Unknown Studio")).toBeInTheDocument();
  });
});
