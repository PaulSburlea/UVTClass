import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import useSWR from "swr";
jest.mock("swr");
import "@testing-library/jest-dom";

// Mochează toast-urile din react-hot-toast o singură dată
const toastSuccessMock = jest.fn();
const toastErrorMock   = jest.fn();
jest.mock("react-hot-toast", () => ({
  toast: {
    success: (...args: any[]) => toastSuccessMock(...args),
    error:   (...args: any[]) => toastErrorMock(...args),
  },
}));

// Mochează ConfirmModal din "@/components/confirm-modal" o singură dată
jest.mock(
  "@/components/confirm-modal",
  () => ({
    __esModule: true,
    ConfirmModal: ({
      isOpen,
      onCancel,
      onConfirm,
      title,
      description,
    }: any) =>
      isOpen ? (
        <div data-testid="mock-confirm-modal">
          <p>{title}</p>
          <p>{description}</p>
          <button onClick={onCancel}>Mock Anulează</button>
          <button onClick={onConfirm}>Mock Confirmă</button>
        </div>
      ) : null,
  })
);

describe("TeacherTable component", () => {
  // Dummy data pentru profesori
  const dummyTeachers = [
    {
      userId:  "t1",
      name:    "Profesorul One",
      email:   "one@școală.ro",
      courses: ["Matematică", "Fizică"],
    },
    {
      userId:  "t2",
      name:    "Profesorul Two",
      email:   "two@școală.ro",
      courses: ["Chimie"],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    // Resetăm fetch înainte de fiecare test
    (global as any).fetch = jest.fn();
  });

  it("randează lista de profesori din SWR și afișează antetul + rândurile corecte", () => {
    (useSWR as jest.Mock).mockImplementation(() => ({
      data:         { teachers: dummyTeachers },
      error:        null,
      mutate:       jest.fn(),
      isValidating: false,
    }));
    const TeacherTable = require("../../../../app/(dashboard)/(routes)/admin/_components/teacher-list").default;

    render(<TeacherTable />);

    // Verificăm anteturile coloanelor
    expect(
      screen.getByRole("columnheader", { name: "Nume profesor" })
    ).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Email" })).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Cursuri predate" })
    ).toBeInTheDocument();
    // Pentru coloana „Șterge” header-ul e un <th><span class="sr-only">Șterge</span></th>
    expect(
      screen.getByRole("columnheader", { name: "Șterge" })
    ).toBeInTheDocument();

    // Verificăm fiecare rând: nume, email, cursuri și butonul „Șterge”
    dummyTeachers.forEach((teacher) => {
      expect(screen.getByText(teacher.name)).toBeInTheDocument();
      expect(screen.getByText(teacher.email)).toBeInTheDocument();
      expect(
        screen.getByText(teacher.courses.join(", "))
      ).toBeInTheDocument();
    });
    // Ar trebui să existe exact câte un buton „Șterge” pentru fiecare profesor
    const deleteButtons = screen.getAllByRole("button", { name: "Șterge" });
    expect(deleteButtons).toHaveLength(dummyTeachers.length);
  });

  it("afișează indicatorul „Încărcare...” când isValidating=true", () => {
    (useSWR as jest.Mock).mockImplementation(() => ({
      data:         { teachers: dummyTeachers },
      error:        null,
      mutate:       jest.fn(),
      isValidating: true,
    }));
    const TeacherTable = require("../../../../app/(dashboard)/(routes)/admin/_components/teacher-list").default;

    render(<TeacherTable />);

    // Ar trebui să existe textul „Încărcare...”
    expect(screen.getByText(/Încărcare\.\.\./i)).toBeInTheDocument();
  });

  it("când se apasă „Șterge” deschide modalul și apoi apelază handleDelete corect (răspuns OK)", async () => {
    const mutateMock = jest.fn();
    
    (useSWR as jest.Mock).mockImplementation(() => ({
      data:         { teachers: dummyTeachers },
      error:        null,
      mutate:       mutateMock,
      isValidating: false,
    }));
    
    const TeacherTable = require("../../../../app/(dashboard)/(routes)/admin/_components/teacher-list").default;

    render(<TeacherTable />);

    // Apăsăm butonul „Șterge” de pe primul profesor
    const deleteButtons = screen.getAllByRole("button", { name: "Șterge" });
    fireEvent.click(deleteButtons[0]);

    // Modalul mock ar trebui să apară
    expect(screen.getByTestId("mock-confirm-modal")).toBeInTheDocument();
    expect(screen.getByText(/Confirmă ștergerea/i)).toBeInTheDocument();

    // Mock-uim fetch ca să rezolve { ok: true }
    (global as any).fetch = jest.fn().mockResolvedValue({
      ok:   true,
      json: async () => ({}),
    });

    // Apăsăm butonul „Mock Confirmă” din modal
    fireEvent.click(screen.getByText("Mock Confirmă"));

    // Așteptăm ca fetch să fie apelat corect
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/admin/remove-teacher",
        expect.objectContaining({
          method:  "DELETE",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ teacherId: dummyTeachers[0].userId }),
        })
      );
    });

    await waitFor(() => {
      expect(mutateMock).toHaveBeenCalledWith(
        expect.any(Function),
        { revalidate: true }
      );
    });

    // După fetch ok, toast.success ar trebui să fie apelat
    expect(toastSuccessMock).toHaveBeenCalledWith("Profesor șters cu succes");

    // Mutate ar trebui să fi fost apelat cu un callback și { revalidate: true }
    await waitFor(() => {
      const mutateCall = (useSWR as jest.Mock).mock.results[0].value.mutate;
      expect(mutateCall).toHaveBeenCalledWith(
        expect.any(Function),
        { revalidate: true }
      );
    });

    // Modalul ar trebui închis
    await waitFor(() => {
      expect(screen.queryByTestId("mock-confirm-modal")).not.toBeInTheDocument();
    });
  });

  it("când handleDelete primește eroare de la server (ok=false), afișează toast.error și închide modalul", async () => {
    (useSWR as jest.Mock).mockImplementation(() => ({
      data:         { teachers: dummyTeachers },
      error:        null,
      mutate:       jest.fn(),
      isValidating: false,
    }));
    const TeacherTable = require("../../../../app/(dashboard)/(routes)/admin/_components/teacher-list").default;

    render(<TeacherTable />);

    // Click pe primul buton „Șterge”
    const deleteButtons = screen.getAllByRole("button", { name: "Șterge" });
    fireEvent.click(deleteButtons[0]);

    // Mock fetch ca să returneze ok=false și un JSON cu eroare
    (global as any).fetch = jest.fn().mockResolvedValue({
      ok:   false,
      json: async () => ({ error: "Nu s-a putut șterge" }),
    });

    // Click pe „Mock Confirmă”
    fireEvent.click(screen.getByText("Mock Confirmă"));

    // Așteptăm ca toast.error să fie apelat cu mesajul din JSON
    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith("Nu s-a putut șterge");
    });

    // Modalul trebuie închis
    await waitFor(() => {
      expect(screen.queryByTestId("mock-confirm-modal")).not.toBeInTheDocument();
    });
  });

  it("când fetch aruncă excepție, afișează toast.error generic și închide modalul", async () => {
    (useSWR as jest.Mock).mockImplementation(() => ({
      data:         { teachers: dummyTeachers },
      error:        null,
      mutate:       jest.fn(),
      isValidating: false,
    }));
    const TeacherTable = require("../../../../app/(dashboard)/(routes)/admin/_components/teacher-list").default;

    render(<TeacherTable />);

    // Click pe al doilea buton „Șterge”
    const deleteButtons = screen.getAllByRole("button", { name: "Șterge" });
    fireEvent.click(deleteButtons[1]);

    // Mock fetch ca să arunce excepție
    (global as any).fetch = jest.fn().mockRejectedValue(new Error("Network down"));

    // Click pe „Mock Confirmă”
    fireEvent.click(screen.getByText("Mock Confirmă"));

    // Așteptăm ca blockul catch să execute toast.error("Eroare la ștergere")
    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith("Eroare la ștergere");
    });

    // Modalul trebuie închis
    await waitFor(() => {
      expect(screen.queryByTestId("mock-confirm-modal")).not.toBeInTheDocument();
    });
  });
});
