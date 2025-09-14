import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

// (1) Mocați react-hot-toast înainte de a importa CommentList
const toastErrorMock = jest.fn();
jest.mock("react-hot-toast", () => ({
  toast: {
    error: (...args: any[]) => toastErrorMock(...args),
    success: jest.fn(),
  },
}));

// (2) Restul mock-urilor externe
jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ 
    src, alt, width, height, className, unoptimized, ...props 
  }: any) => {
    if (!src || src === "") return null;
    return (
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        data-unoptimized={unoptimized ? "true" : undefined}
        {...props}
      />
    );
  },
}));

jest.mock("@clerk/nextjs", () => ({
  useUser: () => ({ user: { id: "current-user", imageUrl: "/avatar.png" } }),
}));

jest.mock("@/lib/use-is-teacher", () => ({
  useIsTeacher: (classroomId: string) => classroomId === "classroom-teacher",
}));

const confirmModalMocksCL = { onCancelCalled: false, onConfirmCalled: false };
jest.mock("@/components/confirm-modal", () => ({
  __esModule: true,
  ConfirmModal: ({ isOpen, onCancel, onConfirm, title, description }: any) =>
    isOpen ? (
      <div data-testid="mock-confirm-modal">
        <p data-testid="modal-title">{title}</p>
        <p data-testid="modal-desc">{description}</p>
        <button
          onClick={() => {
            confirmModalMocksCL.onCancelCalled = true;
            onCancel();
          }}
        >
          Mock.Cancel
        </button>
        <button
          onClick={() => {
            confirmModalMocksCL.onConfirmCalled = true;
            onConfirm();
          }}
        >
          Mock.Confirm
        </button>
      </div>
    ) : null,
}));

jest.mock("@/components/ui/dropdown-menu", () => ({
  __esModule: true,
  DropdownMenu: ({ children }: any) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: any) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: any) => <div>{children}</div>,
  DropdownMenuItem: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}));

jest.mock(
  "../../../../app/(dashboard)/(routes)/teacher/courses/[courseId]/details/[postId]/_components/comment-box",
  () => ({
    __esModule: true,
    CommentBox: ({
      avatarUrl,
      postId,
      commentToEdit,
      onCommentAdded,
      onCommentUpdated,
      replyTo,
      onCancelReply,
    }: any) => (
      <div data-testid="mock-comment-box">
        <span data-testid="box-avatar">{avatarUrl}</span>
        <span data-testid="box-postid">{postId}</span>
        <span data-testid="box-comment-to-edit">
          {commentToEdit?.id ?? "no-edit"}
        </span>
        <span data-testid="box-reply-to">{replyTo?.id ?? "no-reply"}</span>
        <button data-testid="box-cancel-reply" onClick={onCancelReply}>
          CancelReply
        </button>
        <button data-testid="box-on-comment-added" onClick={onCommentAdded}>
          OnAdded
        </button>
        <button
          data-testid="box-on-comment-updated"
          onClick={() =>
            onCommentUpdated({
              id: "upd",
              content: "x",
              createdAt: "",
              authorId: "",
              authorName: "",
              authorAvatar: "",
            })
          }
        >
          OnUpdated
        </button>
      </div>
    ),
  })
);

// Importul componentelor reale (după ce am aplicat toate mock-urile)
import { CommentList, Comment } from "../../../../app/(dashboard)/(routes)/teacher/courses/[courseId]/details/[postId]/_components/comment-list";

describe("CommentList", () => {
  const baseComments: Comment[] = [
    {
      id: "c1",
      content: "Comentariu de top",
      createdAt: new Date().toISOString(),
      editedAt: "",
      authorId: "userA",
      authorName: "Ana",
      authorAvatar: undefined,
      replies: [
        {
          id: "r1",
          content: "Reply 1",
          createdAt: new Date().toISOString(),
          authorId: "userB",
          authorName: "Bogdan",
          authorAvatar: undefined,
        },
      ],
    },
    {
      id: "c2",
      content: "Alt coment",
      createdAt: new Date().toISOString(),
      editedAt: "",
      authorId: "current-user", // ca să testăm canEdit = true
      authorName: "Ștefan",
      authorAvatar: undefined,
      replies: [],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    confirmModalMocksCL.onCancelCalled = false;
    confirmModalMocksCL.onConfirmCalled = false;
  });

  it("randează fiecare comentariu și reply‐ul aferent", () => {
    render(
      <CommentList
        comments={baseComments}
        postId="p1"
        postAuthorId="userA"
        classroomId="classroom-student"
        onCommentsChange={jest.fn()}
        setCommentToEdit={jest.fn()}
        commentToEdit={null}
      />
    );

    expect(screen.getByText("Comentariu de top")).toBeInTheDocument();
    expect(screen.getByText("Alt coment")).toBeInTheDocument();
    expect(screen.getByText("Reply 1")).toBeInTheDocument();
    expect(screen.getByTestId("mock-comment-box")).toBeInTheDocument();
  });

  it("afișează opțiunea Răspunde și apelează handleReplyClick pentru valid user", async () => {
    (global as any).fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ email: "bogdan@mail" }),
    });

    render(
      <CommentList
        comments={baseComments}
        postId="p1"
        postAuthorId="userA"
        classroomId="classroom-student"
        onCommentsChange={jest.fn()}
        setCommentToEdit={jest.fn()}
        commentToEdit={null}
      />
    );

    const replyButtons = screen.getAllByText("Răspunde");
    fireEvent.click(replyButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId("box-reply-to")).toHaveTextContent("c1");
    });
  });

  it("afișează opțiunea Șterge și deschide ConfirmModal corect (user = postAuthor sau teacher)", async () => {
    (global as any).fetch = jest.fn().mockResolvedValue({ ok: true });
    const onCommentsChangeMock = jest.fn();

    render(
      <CommentList
        comments={baseComments}
        postId="p1"
        postAuthorId="current-user"
        classroomId="classroom-student"
        onCommentsChange={onCommentsChangeMock}
        setCommentToEdit={jest.fn()}
        commentToEdit={null}
      />
    );

    const deleteButtons = screen.getAllByText("Șterge");
    fireEvent.click(deleteButtons[1]);

    expect(screen.getByTestId("mock-confirm-modal")).toBeInTheDocument();
    expect(screen.getByTestId("modal-title")).toHaveTextContent("Șterge comentariul");

    fireEvent.click(screen.getByText("Mock.Confirm"));

    await waitFor(() => {
      expect(onCommentsChangeMock).toHaveBeenCalled();
      expect(screen.queryByTestId("mock-confirm-modal")).not.toBeInTheDocument();
    });
  });

  it("aruncă toast.error când fetch DELETE răspunde ok=false", async () => {
    (global as any).fetch = jest.fn().mockResolvedValue({ ok: false });
    const onCommentsChangeMock = jest.fn();

    render(
      <CommentList
        comments={baseComments}
        postId="p1"
        postAuthorId="current-user"
        classroomId="classroom-student"
        onCommentsChange={onCommentsChangeMock}
        setCommentToEdit={jest.fn()}
        commentToEdit={null}
      />
    );

    fireEvent.click(screen.getAllByText("Șterge")[1]);
    fireEvent.click(screen.getByText("Mock.Confirm"));

    await waitFor(() => {
      // acum toast.error e înlocuit cu toastErrorMock
      expect(toastErrorMock).toHaveBeenCalledWith(
        "Nu ai permisiunea să ștergi acest comentariu"
      );
      expect(screen.queryByTestId("mock-confirm-modal")).not.toBeInTheDocument();
    });
  });
});
