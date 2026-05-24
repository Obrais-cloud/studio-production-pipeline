import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { api } from "@/lib/api";

describe("api client", () => {
  let setTimeoutSpy: ReturnType<typeof vi.spyOn> | null = null;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    if (setTimeoutSpy) {
      setTimeoutSpy.mockRestore();
      setTimeoutSpy = null;
    }
  });

  it("getProjects returns parsed JSON", async () => {
    const mockProjects = [{ id: "1", title: "Test" }];
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockProjects,
      } as Response)
    );

    const result = await api.getProjects();
    expect(result).toEqual(mockProjects);
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining("/projects"), undefined);
  });

  it("retries on network failure then throws", async () => {
    setTimeoutSpy = vi.spyOn(global, "setTimeout").mockImplementation((cb: TimerHandler) => {
      if (typeof cb === "function") cb();
      return 0 as unknown as ReturnType<typeof setTimeout>;
    });

    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockRejectedValueOnce(new Error("Network error"))
        .mockRejectedValueOnce(new Error("Network error"))
        .mockRejectedValueOnce(new Error("Network error"))
    );

    await expect(api.getProjects()).rejects.toThrow("Network error");
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it("retries once then succeeds", async () => {
    setTimeoutSpy = vi.spyOn(global, "setTimeout").mockImplementation((cb: TimerHandler) => {
      if (typeof cb === "function") cb();
      return 0 as unknown as ReturnType<typeof setTimeout>;
    });

    const mockProjects = [{ id: "1", title: "Test" }];
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockRejectedValueOnce(new Error("Network error"))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockProjects,
        } as Response)
    );

    const result = await api.getProjects();
    expect(result).toEqual(mockProjects);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("throws on HTTP error response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => "Internal Server Error",
      } as Response)
    );

    await expect(api.getProjects()).rejects.toThrow("HTTP 500");
  });
});
