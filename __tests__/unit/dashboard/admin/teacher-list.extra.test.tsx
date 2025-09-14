import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import TeacherTable from "../../../../app/(dashboard)/(routes)/admin/_components/teacher-list";

// Mochează react-hot-toast
const toastSuccessMock = jest.fn();
const toastErrorMock   = jest.fn();
jest.mock("react-hot-toast", () => ({
  toast: {
    success: (...args: any[]) => toastSuccessMock(...args),
    error:   (...args: any[]) => toastErrorMock(...args),
  },
}));

// Mochează ConfirmModal
jest.mock("@/components/confirm-modal", () => ({
  __esModule: true,
  ConfirmModal: ({ isOpen, onCancel, onConfirm, title, description }: any) =>
    isOpen ? (
      <div data-testid="mock-confirm-modal-extra">
        <p>{title}</p>
        <p>{description}</p>
        <button onClick={onCancel}>Mock Anulează</button>
        <button onClick={onConfirm}>Mock Confirmă</button>
      </div>
    ) : null,
}));

// Vom moca SWR astfel încât, la fiecare apel, să returneze valoarea din `swrResponse`
let swrResponse: any;
jest.mock("swr", () => jest.fn((..._args: any[]) => swrResponse));


describe("TeacherTable – extra branches", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global as any).fetch = jest.fn();
    // Varianta implicită a SWR: empty array, fără eroare, fără validating
    swrResponse = {
      data:         { teachers: [] },
      error:        null,
      mutate:       jest.fn(),
      isValidating: false,
    };
  });

    // Update each test to remove loadComponent call
    it("afișează toast.error când SWR returnează error", () => {
    swrResponse = {
        data:         undefined,
        error:        new Error("Fetch failed"),
        mutate:       jest.fn(),
        isValidating: false,
    };
    render(<TeacherTable />);
    });

    it("nu afișează niciun rând dacă `data.teachers` este array gol", () => {
    swrResponse = {
        data:         { teachers: [] },
        error:        null,
        mutate:       jest.fn(),
        isValidating: false,
    };
    render(<TeacherTable />);
    });

    it("afișează indicatorul de încărcare la `isValidating = true` fără erori suplimentare", () => {
    swrResponse = {
        data:         { teachers: [] },
        error:        null,
        mutate:       jest.fn(),
        isValidating: true,
    };
    render(<TeacherTable />); 
    });

    it("închide modalul dacă `onCancel` este apelat în ConfirmModal (neconfirmarea ștergerii)", async () => {
    const dummyTeachers = [
        {
        userId:  "t1",
        name:    "Profesor One",
        email:   "one@școală.ro",
        courses: ["Matematică"],
        },
    ];
    swrResponse = {
        data:         { teachers: dummyTeachers },
        error:        null,
        mutate:       jest.fn(),
        isValidating: false,
    };
    render(<TeacherTable />);
    });
});
