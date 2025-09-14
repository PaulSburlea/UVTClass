import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import "@testing-library/jest-dom";

// Add this at the top of the file
beforeAll(() => {
  global.URL.createObjectURL = jest.fn(() => "mock-url");
});

afterAll(() => {
  (global.URL.createObjectURL as jest.Mock).mockRestore();
});

// Mochează react-hot-toast
const toastSuccessMock = jest.fn();
const toastErrorMock = jest.fn();
jest.mock("react-hot-toast", () => ({
  toast: {
    success: (...args: any[]) => toastSuccessMock(...args),
    error: (...args: any[]) => toastErrorMock(...args),
  },
}));

// Mochează next/image
jest.mock("next/image", () => (props: any) => <img {...props} />);

// Mochează Dialog
jest.mock("@/components/ui/dialog", () => ({
  __esModule: true,
  Dialog: ({ open, children }: any) => (open ? <div>{children}</div> : null),
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <h2>{children}</h2>,
}));

import { PostForm } from "../../../../app/(dashboard)/(routes)/teacher/posts/_components/post-form";

describe("PostForm – extra branches", () => {
  const onMaterialAddedMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (global as any).fetch = jest.fn();
  });

  it("afișează toast.error când POST-ul răspunde ok: false", async () => {
    // Mocăm fetch pentru POST create care returnează ok: false
    (global as any).fetch = jest.fn().mockResolvedValue({ ok: false });

    render(<PostForm courseId="c1" onMaterialAdded={onMaterialAddedMock} />);

    // Deschidem formularul
    fireEvent.click(screen.getByText("Adaugă material / anunț"));

    // Completăm titlu și conținut
    fireEvent.change(screen.getByPlaceholderText("Titlul postării"), {
      target: { value: "Titlu test" },
    });
    fireEvent.change(screen.getByPlaceholderText("Scrie un anunț sau descriere..."), {
      target: { value: "Conținut test" },
    });

    // Apăsăm „Postează”
    const postButton = screen.getByRole("button", { name: "Postează" });
    await act(async () => {
      fireEvent.click(postButton);
    });

    // Așteptăm ca POST-ul să fie apelat
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/post/create",
        expect.objectContaining({
          method: "POST",
          body: expect.any(FormData),
        })
      );
    });

    // Cum ok: false → toast.error("Eroare la salvare.")
    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith("Eroare la salvare.");
    });

    // onMaterialAdded nu este apelat
    expect(onMaterialAddedMock).not.toHaveBeenCalled();
  });

  it("perimte ștergerea unui fișier local din preview și actualizează lista", async () => {
    // Definim clasa MockFile cu semnătură compatibilă File constructor
    class MockFile {
      name: string;
      type: string;

      constructor(public parts: any[], public fileName: string, public properties: FilePropertyBag) {
        this.name = fileName;
        this.type = properties.type || "";
      }

      // un stub pentru a împlini API-ul lui File
      slice(): Blob {
        return new Blob(this.parts, { type: this.type });
      }
    }
    // Override global File
    global.File = MockFile as any;

    render(<PostForm courseId="c1" onMaterialAdded={onMaterialAddedMock} />);

    // Deschidem formularul
    fireEvent.click(screen.getByText("Adaugă material / anunț"));

    // Pregătim un File
    const file1 = new File(["abc"], "imagine.png", { type: "image/png" });

    // Folosim test ID pentru input (afișează în PostForm: data-testid="file-input")
    const fileInput = screen.getByTestId("file-input") as HTMLInputElement;

    // Setăm manual `files`
    Object.defineProperty(fileInput, "files", {
      value: [file1],
    });
    fireEvent.change(fileInput);

    // Așteptăm să apară item-ul în listă (titlul fișierului)
    await waitFor(() => {
      expect(screen.getByText("imagine.png")).toBeInTheDocument();
    });

    // Folosim test ID pentru butonul de ștergere (ex: data-testid={`remove-${fileName}`})
    const removeButton = screen.getByTestId("remove-imagine.png");
    fireEvent.click(removeButton);

    // Verificăm dispariția fișierului din listă
    await waitFor(() => {
      expect(screen.queryByText("imagine.png")).not.toBeInTheDocument();
    });
  });
});
