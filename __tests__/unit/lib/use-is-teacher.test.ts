import { renderHook } from "@testing-library/react";
import { waitFor } from "@testing-library/react";
import { useIsTeacher } from "@/lib/use-is-teacher";

// Supradefinim global.fetch
declare let global: any;

describe("useIsTeacher", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returnează true dacă API răspunde cu role: 'TEACHER'", async () => {
    // Mocăm fetch să întoarcă { role: "TEACHER" }
    const fetchMock = jest.fn().mockResolvedValue({
      ok:   true,
      json: async () => ({ role: "TEACHER" }),
    });
    global.fetch = fetchMock;

    const { result } = renderHook(() => useIsTeacher("cl-1"));

    // inițial, isTeacher === false
    expect(result.current).toBe(false);

    // Așteptăm ca hook-ul să facă fetch și să-și actualizeze starea
    await waitFor(() => {
      expect(result.current).toBe(true);
    });

    expect(fetchMock).toHaveBeenCalledWith("/api/classrooms/cl-1/role");
  });

  it("returnează false dacă API răspunde cu role: 'STUDENT'", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok:   true,
      json: async () => ({ role: "STUDENT" }),
    });
    global.fetch = fetchMock;

    const { result } = renderHook(() => useIsTeacher("cl-2"));

    expect(result.current).toBe(false);

    await waitFor(() => {
      expect(result.current).toBe(false);
    });

    expect(fetchMock).toHaveBeenCalledWith("/api/classrooms/cl-2/role");
  });

  it("nu modifică starea dacă `res.ok === false` (starea rămâne false)", async () => {
    const fetchMock = jest.fn().mockResolvedValue({ ok: false });
    global.fetch = fetchMock;

    const { result } = renderHook(() => useIsTeacher("cl-3"));

    expect(result.current).toBe(false);

    // Așteptăm puțin pentru a ne asigura că efectul s-a rulat
    await waitFor(() => {
      expect(result.current).toBe(false);
    });

    expect(fetchMock).toHaveBeenCalledWith("/api/classrooms/cl-3/role");
  });

  it("gestionază excepțiile fetch fără a arunca (starea rămâne false)", async () => {
    const fetchMock = jest.fn().mockRejectedValue(new Error("Network error"));
    global.fetch = fetchMock;

    const { result } = renderHook(() => useIsTeacher("cl-4"));

    expect(result.current).toBe(false);

    await waitFor(() => {
      expect(result.current).toBe(false);
    });

    expect(fetchMock).toHaveBeenCalledWith("/api/classrooms/cl-4/role");
  });
});
