import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

// Mochează componenta PostList care este importată în PostListWrapper
jest.mock(
  "@/app/(dashboard)/(routes)/teacher/posts/_components/post-list",
  () => ({
    __esModule: true,
    PostList: ({
      courseId,
      refetchKey,
      onPostUpdated,
      editable,
      userId,
      userRole,
    }: any) => (
      <div>
        <span data-testid="courseId">{courseId}</span>
        <span data-testid="refetchKey">{refetchKey}</span>
        <span data-testid="editable">{String(editable)}</span>
        <span data-testid="userId">{userId}</span>
        <span data-testid="userRole">{userRole}</span>
        <button onClick={onPostUpdated}>Update</button>
      </div>
    ),
  })
);

// Importă componenta wrapper de testat
import PostListWrapper from "../../../../app/(dashboard)/(routes)/student/courses/[courseId]/_components/post-list-wrapper";

describe("PostListWrapper", () => {
  it("trimite proprietățile corecte către PostList și actualizează refetchKey", () => {
    render(
      <PostListWrapper
        courseId="course-123"
        userId="user-456"
        userRole="STUDENT"
      />
    );

    // Verifică că primește inițial refetchKey = 0
    expect(screen.getByTestId("courseId")).toHaveTextContent("course-123");
    expect(screen.getByTestId("refetchKey")).toHaveTextContent("0");
    expect(screen.getByTestId("editable")).toHaveTextContent("false");
    expect(screen.getByTestId("userId")).toHaveTextContent("user-456");
    expect(screen.getByTestId("userRole")).toHaveTextContent("STUDENT");

    // Apasă butonul „Update” care apelează onPostUpdated()
    fireEvent.click(screen.getByRole("button", { name: "Update" }));

    // Acum refetchKey ar trebui să fie incrementat la 1
    expect(screen.getByTestId("refetchKey")).toHaveTextContent("1");
  });
});
