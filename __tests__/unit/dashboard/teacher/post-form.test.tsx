import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
  within,
} from "@testing-library/react";
import "@testing-library/jest-dom";

// Mochează react-hot-toast
const toastSuccessMock = jest.fn();
const toastErrorMock = jest.fn();
jest.mock("react-hot-toast", () => ({
  toast: {
    success: (...args: any[]) => toastSuccessMock(...args),
    error:   (...args: any[]) => toastErrorMock(...args),
  },
}));

async function getFormDataValues(formData: FormData) {
  const values: Record<string, any> = {};
  for (const [key, value] of formData.entries()) {
    if (values[key]) {
      if (Array.isArray(values[key])) {
        values[key].push(value);
      } else {
        values[key] = [values[key], value];
      }
    } else {
      values[key] = value;
    }
  }
  return values;
}

// Mochează next/image
jest.mock("next/image", () => (props: any) => <img {...props} />);

// Mochează Dialog din ui/dialog
jest.mock("@/components/ui/dialog", () => ({
  __esModule: true,
  Dialog: ({ open, onOpenChange, children }: any) =>
    open ? <div data-testid="mock-dialog">{children}</div> : null,
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <h2>{children}</h2>,
}));

// Importă componenta reală
import { PostForm } from "@/app/(dashboard)/(routes)/teacher/posts/_components/post-form";

describe("PostForm", () => {
  const onMaterialAddedMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (global as any).fetch = jest.fn();
  });

  it("inițial, formularul este închis; se deschide și se închide la click pe zonă", () => {
    render(<PostForm courseId="c1" onMaterialAdded={onMaterialAddedMock} />);

    // Inițial, butonul cu text "Adaugă material / anunț" e afișat
    const toggleDiv = screen.getByText("Adaugă material / anunț");
    expect(toggleDiv).toBeInTheDocument();

    // Apăsăm pentru a deschide formularul
    fireEvent.click(toggleDiv);
    // Acum apare form-ul cu input-uri
    expect(screen.getByPlaceholderText("Titlul postării")).toBeInTheDocument();

    // Apăsăm din nou pentru a închide
    fireEvent.click(toggleDiv);
    expect(screen.queryByPlaceholderText("Titlul postării")).not.toBeInTheDocument();
  });

  it("afișează eroare când titlul e gol și se face postare", async () => {
    render(<PostForm courseId="c1" onMaterialAdded={onMaterialAddedMock} />);

    // Deschidem formularul
    await act(async () => {
      fireEvent.click(screen.getByText("Adaugă material / anunț"));
    });

    // Nu completăm nimic (titlu gol), apăsăm „Postează”
    const postButton = screen.getByRole("button", { name: "Postează" });
    await act(async () => {
      fireEvent.click(postButton);
    });

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith("Titlul este obligatoriu.");
    });

    // Verificăm că nu s-a făcut apelul fetch
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("postează conținut text simplu și apelează onMaterialAdded la succes", async () => {
    // Mock fetch pentru POST /api/post/create
    const mockFetch = jest.fn().mockResolvedValue({ ok: true });
    (global as any).fetch = mockFetch;

    render(<PostForm courseId="c1" onMaterialAdded={onMaterialAddedMock} />);

    // Deschidem formularul
    await act(async () => {
      fireEvent.click(screen.getByText("Adaugă material / anunț"));
    });

    // Completăm titlul și conținutul
    const titleInput = screen.getByPlaceholderText("Titlul postării");
    const textTextarea = screen.getByPlaceholderText("Scrie un anunț sau descriere...");
    fireEvent.change(titleInput, { target: { value: "Anunț" } });
    fireEvent.change(textTextarea, { target: { value: "Text anunț" } });

    // Apăsăm „Postează”
    const postButton = screen.getByRole("button", { name: "Postează" });
    await act(async () => {
      fireEvent.click(postButton);
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/post/create", expect.any(Object));
    });

    // Get the actual FormData that was trimis
    const fetchCall = mockFetch.mock.calls[0];
    const formData  = await getFormDataValues(fetchCall[1].body as FormData);

    // Verificăm conținutul FormData
    expect(formData.courseId).toBe("c1");
    expect(formData.title).toBe("Anunț");
    expect(formData.content).toBe("Text anunț");

    // După reușită: toast.success și onMaterialAdded
    await waitFor(() => {
      expect(toastSuccessMock).toHaveBeenCalledWith("Postarea a fost publicată cu succes!");
      expect(onMaterialAddedMock).toHaveBeenCalledTimes(1);
    });

    // Formularele și starea se resetează: Formularele nu mai sunt vizibile
    expect(screen.queryByPlaceholderText("Titlul postării")).not.toBeInTheDocument();
  });

 it("adaugă un link YouTube și un link extern în filesPreview și le include în FormData", async () => {
    // Mock fetch pentru POST
    const mockFetch = jest.fn().mockResolvedValue({ ok: true });
    (global as any).fetch = mockFetch;

    render(<PostForm courseId="c1" onMaterialAdded={onMaterialAddedMock} />);

    // 1) Deschidem formularul
    await act(async () => {
      fireEvent.click(screen.getByText("Adaugă material / anunț"));
    });
    
    // Așteptăm ca formularul să fie complet deschis
    await waitFor(() => {
      expect(screen.getByPlaceholderText("Titlul postării")).toBeInTheDocument();
    });

  // 2) Adăugăm YouTube
  const ytButton = await screen.findByTestId("youtube-button");
  await act(async () => {
    fireEvent.click(ytButton);
  });

  // Așteptăm ca modalul YouTube să apară
  await waitFor(() => {
    expect(screen.getByPlaceholderText("https://www.youtube.com/watch?v=...")).toBeInTheDocument();
  });

  const ytInput = screen.getByPlaceholderText("https://www.youtube.com/watch?v=...");
  fireEvent.change(ytInput, { target: { value: "https://www.youtube.com/watch?v=vid123" } });
  
  // Get the modal as HTMLElement
  const modal = screen.getByTestId("mock-dialog") as HTMLElement;
  const ytAddBtn = within(modal).getByRole("button", { name: "Adaugă" });
  
  await act(async () => {
    fireEvent.click(ytAddBtn);
  });

  // 3) Adăugăm link extern
  const linkButton = await screen.findByTestId("external-link-button");
  await act(async () => {
    fireEvent.click(linkButton);
  });

  // Așteptăm ca modalul link extern să apară
  await waitFor(() => {
    expect(screen.getByPlaceholderText("https://...")).toBeInTheDocument();
  });

  const linkInput = screen.getByPlaceholderText("https://...");
  fireEvent.change(linkInput, { target: { value: "https://exemplu.ro" } });
  
  // Get the modal again as it's a new instance
  const linkModalElement = screen.getByTestId("mock-dialog") as HTMLElement;
  const linkAddBtn = within(linkModalElement).getByRole("button", { name: "Adaugă" });
  
  await act(async () => {
    fireEvent.click(linkAddBtn);
  });

    // 4) Verificăm preview-ul
    await waitFor(() => {
      const previewItems = screen.getAllByRole("listitem");
      expect(previewItems).toHaveLength(2);
      expect(screen.getByText("https://www.youtube.com/watch?v=vid123")).toBeInTheDocument();
      expect(screen.getByText("https://exemplu.ro")).toBeInTheDocument();
    });

    // 5) Completăm titlul
    fireEvent.change(screen.getByPlaceholderText("Titlul postării"), {
      target: { value: "Titlu cu linkuri" },
    });

    // 6) Apăsăm „Postează”
    const postButton = screen.getByRole("button", { name: "Postează" });
    await act(async () => {
      fireEvent.click(postButton);
    });

    // 7) Verificăm apelul fetch
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });
    
    const sentForm = mockFetch.mock.calls[0][1].body as FormData;
    const formValues = await getFormDataValues(sentForm);
    
    expect(formValues.links).toEqual([
      "https://www.youtube.com/watch?v=vid123",
      "https://exemplu.ro"
    ]);
    expect(formValues.types).toEqual(["YOUTUBE", "LINK"]);

    // 8) Verificăm callback-urile
    await waitFor(() => {
      expect(toastSuccessMock).toHaveBeenCalledWith("Postarea a fost publicată cu succes!");
      expect(onMaterialAddedMock).toHaveBeenCalled();
    });
  });

  it("reține doar fișierele unice și le include în FormData la POST", async () => {
    // Vom moca fetch POST
    const mockFetch = jest.fn().mockResolvedValue({ ok: true });
    (global as any).fetch = mockFetch;

    render(<PostForm courseId="c1" onMaterialAdded={onMaterialAddedMock} />);

    // 1) Deschidem formularul
    await act(async () => {
      fireEvent.click(screen.getByText("Adaugă material / anunț"));
    });

    // 2) Mocăm input-ul de fișiere: creăm două File-uri
    const file1 = new File(["content"], "doc1.pdf", { type: "application/pdf" });
    const file2 = new File(["content"], "doc2.pdf", { type: "application/pdf" });

    // Folosim aria-label="" selectors pentru input type="file"
    const fileInput = screen.getByTestId("file-input") as HTMLInputElement;
    Object.defineProperty(fileInput, "files", {
      value: [file1, file2],
    });
    fireEvent.change(fileInput);

    // Ar trebui să apară 2 elemente în preview
    await waitFor(() => {
      const previewItems = screen.getAllByRole("listitem");
      expect(previewItems).toHaveLength(2);
      expect(screen.getByText("doc1.pdf")).toBeInTheDocument();
      expect(screen.getByText("doc2.pdf")).toBeInTheDocument();
    });

    // 3) Completăm titlul
    fireEvent.change(screen.getByPlaceholderText("Titlul postării"), {
      target: { value: "Titlu cu fișiere" },
    });

    // 4) Apăsăm „Postează”
    const postButton = screen.getByRole("button", { name: "Postează" });
    await act(async () => {
      fireEvent.click(postButton);
    });

    // 5) Verificăm FormData conține 2 fișiere și 2 fileNames
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/post/create", expect.any(FormData));
    });
    const sentForm = (mockFetch.mock.calls[0][1] as RequestInit).body as FormData;
    const fileNames = sentForm.getAll("fileNames");
    expect(fileNames).toEqual(["doc1.pdf", "doc2.pdf"]);
    expect((sentForm.getAll("files") as File[]).map((f) => f.name)).toEqual([
      "doc1.pdf",
      "doc2.pdf",
    ]);

    // După succes, toast.success și onMaterialAdded
    await waitFor(() => {
      expect(toastSuccessMock).toHaveBeenCalledWith("Postarea a fost publicată cu succes!");
      expect(onMaterialAddedMock).toHaveBeenCalledTimes(1);
    });
  });
});
