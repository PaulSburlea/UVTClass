import React from "react";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

// Mochează next/image (nu facem nimic special; doar importa ca un <img>)
jest.mock("next/image", () => (props: any) => <img {...props} />);

// Importă componenta reală
import { CommentBox, Comment } from "@/app/(dashboard)/(routes)/teacher/courses/[courseId]/details/[postId]/_components/comment-box";

describe("CommentBox", () => {
  const sampleComment: Comment = {
    id:          "com-1",
    content:     "Text inițial",
    createdAt:   new Date().toISOString(),
    authorId:    "user-2",
    authorName:  "Maria",
    authorAvatar:"",
    replies:     [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("randează textarea golă și buton disabled inițial (fără commentToEdit și fără replyTo)", () => {
    render(
      <CommentBox
        avatarUrl="/avatar.png"
        postId="p1"
      />
    );

    const textarea = screen.getByPlaceholderText("Adaugă un comentariu...");
    expect(textarea).toBeInTheDocument();
    expect((textarea as HTMLTextAreaElement).value).toBe("");

    const sendButton = screen.getByRole("button");
    // Disabled deoarece textarea.value.trim() === ""
    expect(sendButton).toBeDisabled();
  });

  it("preumplează textarea când există commentToEdit și când există replyTo", () => {
    // 1) Când există `commentToEdit`
    const { rerender } = render(
      <CommentBox
        avatarUrl="/avatar.png"
        postId="p1"
        commentToEdit={sampleComment}
      />
    );

    const editTextarea = screen.getByPlaceholderText("Editează comentariul...");
    expect(editTextarea).toBeInTheDocument();
    expect((editTextarea as HTMLTextAreaElement).value).toBe("Text inițial");

    // 2) Când există `replyTo` (fără commentToEdit)
    rerender(
      <CommentBox
        avatarUrl="/avatar.png"
        postId="p1"
        replyTo={{ id: "com-2", authorName: "Ion", authorEmail: "ion@mail" }}
      />
    );
      // 3) După anulare, placeholder-ul revine la valoarea inițială
    rerender(
        <CommentBox
        avatarUrl="/avatar.png"
        postId="p1"
        />
    );

      const defaultTextarea = screen.getByPlaceholderText("Adaugă un comentariu...");
    expect((defaultTextarea as HTMLTextAreaElement).value).toBe("");
});

  it("apelează fetch PATCH când commentToEdit este definit și trimis", async () => {
    const onEditDoneMock = jest.fn();
    const onCommentUpdatedMock = jest.fn();

    // Mochează fetch pentru PATCH
    (global as any).fetch = jest.fn().mockResolvedValue({ ok: true });

      const { rerender } = render(
        <CommentBox
        avatarUrl="/avatar.png"
        postId="p1"
        commentToEdit={sampleComment}
        onEditDone={onEditDoneMock}
        onCommentUpdated={onCommentUpdatedMock}
        />
    );


    // Modificăm textarea (placeholder: "Editează comentariul...")
    const textarea = screen.getByPlaceholderText("Editează comentariul...");
    fireEvent.change(textarea, { target: { value: "Text editat" } });
    expect((textarea as HTMLTextAreaElement).value).toBe("Text editat");

    // Butonul devine enabled
    const sendButton = screen.getByRole("button");
    expect(sendButton).toBeEnabled();

    // Click pe buton (înconjurat de act pentru startTransition)
    await act(async () => {
      fireEvent.click(sendButton);
    });

    // Așteptăm ca fetch să fi fost apelat cu PATCH
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/comments/com-1",
        expect.objectContaining({
          method:  "PATCH",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ content: "Text editat" }),
        })
      );
    });
      // După ce așteptăm ca fetch să fi fost apelat
    await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
        "/api/comments/com-1",
        expect.objectContaining({
            method: "PATCH",
        })
        );
    });

      rerender(
        <CommentBox
        avatarUrl="/avatar.png"
        postId="p1"
        onCommentAdded={jest.fn()}
        onCommentUpdated={onCommentUpdatedMock}
        />
    );


    // Callback-urile corespunzătoare
    expect(onCommentUpdatedMock).toHaveBeenCalledWith({
      ...sampleComment,
      content: "Text editat",
    });
    expect(onEditDoneMock).toHaveBeenCalled();

    // Textarea resetează la "" și placeholder revine la "Adaugă un comentariu..."
    const resetTextarea = screen.getByPlaceholderText("Adaugă un comentariu...");
    expect((resetTextarea as HTMLTextAreaElement).value).toBe("");
  });

  it("apelează fetch POST când adaugă un comentariu nou și apelează onCommentAdded", async () => {
    const onCommentAddedMock = jest.fn();

    (global as any).fetch = jest.fn().mockResolvedValue({ ok: true });

    render(
      <CommentBox
        avatarUrl="/avatar.png"
        postId="p1"
        onCommentAdded={onCommentAddedMock}
      />
    );

    // Introducem text nou (placeholder: "Adaugă un comentariu...")
    const textarea = screen.getByPlaceholderText("Adaugă un comentariu...");
    fireEvent.change(textarea, { target: { value: "Comentariu nou" } });
    expect((textarea as HTMLTextAreaElement).value).toBe("Comentariu nou");

    const sendButton = screen.getByRole("button");
    expect(sendButton).toBeEnabled();

    // Click pe buton (înconjurat de act)
    await act(async () => {
      fireEvent.click(sendButton);
    });

    // Așteptăm ca fetch să fie apelat cu POST
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/comments",
        expect.objectContaining({
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({
            postId:          "p1",
            content:         "Comentariu nou",
            parentCommentId: null,
          }),
        })
      );
    });

    expect(onCommentAddedMock).toHaveBeenCalled();

    // Textarea resetează la ""
    const resetTextarea = screen.getByPlaceholderText("Adaugă un comentariu...");
    expect((resetTextarea as HTMLTextAreaElement).value).toBe("");
  });
});
