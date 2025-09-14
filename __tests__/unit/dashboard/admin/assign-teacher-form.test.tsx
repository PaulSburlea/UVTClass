import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import AssignTeacherForm from "../../../../app/(dashboard)/(routes)/admin/_components/assign-teacher-form";

// Mochează toast-urile din react-hot-toast
const toastSuccessMock = jest.fn();
const toastErrorMock = jest.fn();
jest.mock("react-hot-toast", () => ({
  toast: {
    success: (...args: any[]) => toastSuccessMock(...args),
    error: (...args: any[]) => toastErrorMock(...args),
  },
}));

// Preparăm un mutateMOCK global pentru SWR
const mutateMock = jest.fn();
jest.mock("swr", () => ({
  useSWRConfig: () => ({ mutate: mutateMock }),
}));

describe("AssignTeacherForm", () => {
  beforeEach(() => {
    // Resetăm toate mock-urile înainte de fiecare test
    jest.clearAllMocks();
    // Restaurăm fetch la valoarea inițială
    (global as any).fetch = jest.fn();
  });

  it("randează input-ul de email și butonul inițial „Atribuie”", () => {
    render(<AssignTeacherForm />);

    const input = screen.getByPlaceholderText(/Email-ul profesorului/i);
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "email");

    const button = screen.getByRole("button", { name: "Atribuie" });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  it("actualizează starea când se tastează un email", () => {
    render(<AssignTeacherForm />);

    const input = screen.getByPlaceholderText(/Email-ul profesorului/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "test@example.com" } });
    expect(input.value).toBe("test@example.com");
  });

  it("prezintă starea de loading („Se atribuie...”) imediat după trimiterea formularului", async () => {
    // Mock pentru fetch care nu rezolvă imediat (pentru a verifica loading-ul)
    let resolveFetch: (value: any) => void;
    const fetchPromise = new Promise(res => {
      resolveFetch = res;
    });
    (global as any).fetch = jest.fn(() => fetchPromise);

    render(<AssignTeacherForm />);

    const input = screen.getByPlaceholderText(/Email-ul profesorului/i);
    fireEvent.change(input, { target: { value: "user@domain.com" } });

    const button = screen.getByRole("button", { name: "Atribuie" });
    fireEvent.click(button);

    // După click, button ar trebui să fie disabled și cu textul „Se atribuie...”
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent("Se atribuie...");

    // Acum rezolvăm fetch-ul ca fiind ok
    resolveFetch!({
      ok: true,
      json: async () => ({})
    });

    // Așteptăm ca elementele să se actualizeze după promisiune
    await waitFor(() => {
      // După rezolvare, butonul revine la „Atribuie” și nu mai este disabled
      expect(screen.getByRole("button", { name: "Atribuie" })).toBeEnabled();
    });
  });

  it("apelează toast.success, resetează câmpul și mută datele în SWR când fetch ok", async () => {
    // Mock pentru fetch care returnează ok
    (global as any).fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({})
    });

    render(<AssignTeacherForm />);

    const input = screen.getByPlaceholderText(/Email-ul profesorului/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "teacher@school.ro" } });

    const button = screen.getByRole("button", { name: "Atribuie" });
    fireEvent.click(button);

    // Așteptăm ca fetch ul să fie apelat și promisiunea rezolvată
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/admin/assign-teacher", expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "teacher@school.ro" }),
      }));
    });

    // După fetch ok, toast.success trebuie apelat
    expect(toastSuccessMock).toHaveBeenCalledWith("Rolul Teacher a fost atribuit!");

    // Câmpul de email trebuie resetat
    expect((screen.getByPlaceholderText(/Email-ul profesorului/i) as HTMLInputElement).value).toBe("");

    // SWR mutate trebuie apelat cu cheia '/api/admin/teachers'
    expect(mutateMock).toHaveBeenCalledWith("/api/admin/teachers");
  });

  it("apelează toast.error cu mesajul din JSON când fetch returnează eroare", async () => {
    // Mock pentru fetch care returnează ok=false și un JSON cu campul error
    (global as any).fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Utilizator inexistent" })
    });

    render(<AssignTeacherForm />);

    const input = screen.getByPlaceholderText(/Email-ul profesorului/i);
    fireEvent.change(input, { target: { value: "noone@school.ro" } });

    const button = screen.getByRole("button", { name: "Atribuie" });
    fireEvent.click(button);

    // Așteptăm ca fetch să fie apelat
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    // După ce rezolvă cu ok=false, toast.error trebuie apelat cu mesajul din JSON
    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith("Utilizator inexistent");
    });

    // Butonul revine la „Atribuie”
    expect(screen.getByRole("button", { name: "Atribuie" })).toBeEnabled();
  });

  it("apelează toast.error cu 'Eroare de rețea' când fetch aruncă excepție", async () => {
    // Mock pentru fetch care aruncă excepție
    (global as any).fetch = jest.fn().mockRejectedValue(new Error("Network failure"));

    render(<AssignTeacherForm />);

    const input = screen.getByPlaceholderText(/Email-ul profesorului/i);
    fireEvent.change(input, { target: { value: "any@domain.ro" } });

    const button = screen.getByRole("button", { name: "Atribuie" });
    fireEvent.click(button);

    // Așteptăm ca try/catch-ul să se încheie
    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith("Eroare de rețea");
    });

    // Butonul revine la „Atribuie”
    expect(screen.getByRole("button", { name: "Atribuie" })).toBeEnabled();
  });
});
