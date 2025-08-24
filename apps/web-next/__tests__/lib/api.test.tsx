import { apiClient } from "@/lib/api";
import { jest } from "@jest/globals";

// Mock fetch
global.fetch = jest.fn();

describe("API Client", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_MOCK = "false";
  });

  it("makes GET requests correctly", async () => {
    const mockResponse = { data: "test" };
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await apiClient.get("/test");

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/test"),
      expect.objectContaining({ method: "GET" })
    );
    expect(result).toEqual(mockResponse);
  });

  it("handles POST requests with data", async () => {
    const mockResponse = { success: true };
    const postData = { name: "test" };
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    await apiClient.post("/test", postData);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/test"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(postData),
      })
    );
  });

  it("uses mock data when NEXT_PUBLIC_MOCK is true", async () => {
    process.env.NEXT_PUBLIC_MOCK = "true";

    const result = await apiClient.get("/parser/documents");

    expect(result).toHaveProperty("documents");
    expect(fetch).not.toHaveBeenCalled();
  });
});
