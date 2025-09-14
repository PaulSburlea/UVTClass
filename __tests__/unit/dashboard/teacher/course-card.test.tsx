import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

// 1) Mochează useRouter din next/navigation
const pushMock = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

// 2) Mochează mutate din swr
jest.mock("swr", () => ({
  mutate: jest.fn(() => Promise.resolve()),
}));

// 3) Mochează ConfirmModal din "@/components/confirm-modal"
const confirmModalMocks: {
  onCancelCalled: boolean;
  onConfirmCalled: boolean;
} = { onCancelCalled: false, onConfirmCalled: false };
jest.mock("@/components/confirm-modal", () => ({
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
        <p data-testid="modal-title">{title}</p>
        <p data-testid="modal-desc">{description}</p>
        <button
          onClick={() => {
            confirmModalMocks.onCancelCalled = true;
            onCancel();
          }}
        >
          Mock.Cancel
        </button>
        <button
          onClick={() => {
            confirmModalMocks.onConfirmCalled = true;
            onConfirm();
          }}
        >
          Mock.Confirm
        </button>
      </div>
    ) : null,
}));

// 4) Importă componenta reală
import { CourseCard } from "@/app/(dashboard)/(routes)/teacher/courses/[courseId]/_components/course-card";

// 5) Un „classroom” de test
const sampleCourse = {
  id:        "course-xyz",
  userId:    "owner-123",
  name:      "Curs Înaltă Tehnologie",
  section:   "Sec A",
  room:      null,
  subject:   null,
  code:      "TECH101",
  createdAt: new Date("2024-01-15"),
  updatedAt: new Date("2024-03-10"),
};

describe("CourseCard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    confirmModalMocks.onCancelCalled = false;
    confirmModalMocks.onConfirmCalled = false;
  });

  it("redirectează către calea corectă când nu e proprietar (click + Enter)", () => {
    // Când currentUserId !== course.userId, redirect către /student/courses/:id
    render(<CourseCard course={sampleCourse} currentUserId="alt-user" />);

    // Click pe container
    const card = screen.getByRole("button");
    fireEvent.click(card);
    expect(pushMock).toHaveBeenCalledWith("/student/courses/course-xyz");

    // Simulăm Enter pe container
    fireEvent.keyDown(card, { key: "Enter", code: "Enter" });
    expect(pushMock).toHaveBeenCalledWith("/student/courses/course-xyz");
  });

  it("afișează butoanele Edit și Delete doar dacă este proprietar", () => {
    render(<CourseCard course={sampleCourse} currentUserId="owner-123" />);

    // După render, butoanele există dar apar cu opacitate 0; totuși putem să le query‐uim
    const editButton = screen.getByTitle("Editează");
    const deleteButton = screen.getByTitle("Șterge");
    expect(editButton).toBeInTheDocument();
    expect(deleteButton).toBeInTheDocument();
  });

  it("redirectează către pagina de editare la click pe butonul Edit (fără propagare)", () => {
    render(<CourseCard course={sampleCourse} currentUserId="owner-123" />);

    const editButton = screen.getByTitle("Editează");
    fireEvent.click(editButton);
    // Fără să cheme push-ul pe „student...”, deoarece este proprietar → ruta de teacher/edit
    expect(pushMock).toHaveBeenCalledWith("/teacher/courses/course-xyz/edit");
  });

  it("afișează ConfirmModal la click pe Delete și invocă handleConfirmDelete (răspuns OK)", async () => {
    // Mock fetch to return ok:true
    const mockFetch = jest.fn().mockResolvedValue({ ok: true });
    (global as any).fetch = mockFetch;
    const mutate = require("swr").mutate as jest.Mock;

    render(<CourseCard course={sampleCourse} currentUserId="owner-123" />);

    // Click delete button
    fireEvent.click(screen.getByTitle("Șterge"));
    
    // Click confirm in modal
    fireEvent.click(screen.getByText("Mock.Confirm"));

    // Wait for async operations to complete
    await waitFor(() => {
      // Verify fetch was called with correct parameters
      expect(mockFetch).toHaveBeenCalledWith(
        `/api/courses/${sampleCourse.id}`,
        { method: "DELETE" }
      );
      
      // Verify SWR mutate was called
      expect(mutate).toHaveBeenCalledWith("/api/courses");
      
      // Verify modal closed
      expect(screen.queryByTestId("mock-confirm-modal")).not.toBeInTheDocument();
    });

    // Verify onConfirm was called
    expect(confirmModalMocks.onConfirmCalled).toBe(true);
  });

  it("afișează un alert când fetch răspunde eroare (ok=false)", async () => {
    // Mock fetch to return ok:false
    const mockFetch = jest.fn().mockResolvedValue({ ok: false });
    (global as any).fetch = mockFetch;
    
    // Mock alert
    const alertMock = jest.spyOn(window, "alert").mockImplementation(() => {});
    
    // Mock console.error to prevent test logs pollution
    const consoleErrorMock = jest.spyOn(console, "error").mockImplementation(() => {});

    render(<CourseCard course={sampleCourse} currentUserId="owner-123" />);

    // Click delete button
    fireEvent.click(screen.getByTitle("Șterge"));
    
    // Click confirm in modal
    fireEvent.click(screen.getByText("Mock.Confirm"));

    // Wait for async operations to complete
    await waitFor(() => {
      // Verify fetch was called
      expect(mockFetch).toHaveBeenCalled();
      
      // Verify alert was shown
      expect(alertMock).toHaveBeenCalledWith("A apărut o eroare la ștergere.");
    });

    // Verify modal remains open after error
    expect(screen.getByTestId("mock-confirm-modal")).toBeInTheDocument();

    // Cleanup
    alertMock.mockRestore();
    consoleErrorMock.mockRestore();
  });
});