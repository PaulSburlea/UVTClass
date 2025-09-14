import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

// Mochează subcomponentele CourseCard, PostForm și PostList
jest.mock(
  "../../../../app/(dashboard)/(routes)/teacher/courses/[courseId]/_components/course-info",
  () => ({
    __esModule: true,
    default: ({ course, currentUserId }: any) => (
      <div data-testid="mock-course-card">
        <span data-testid="course-name">{course.name}</span>
        <span data-testid="current-user">{currentUserId}</span>
      </div>
    ),
  })
);
jest.mock(
  "../../../../app/(dashboard)/(routes)/teacher/posts/_components/post-form",
  () => ({
    __esModule: true,
    PostForm: ({ courseId, onMaterialAdded }: any) => (
      <div data-testid="mock-post-form">
        <span data-testid="form-course">{courseId}</span>
        <button onClick={onMaterialAdded}>Mock Add</button>
      </div>
    ),
  })
);

jest.mock(
  "../../../../app/(dashboard)/(routes)/teacher/posts/_components/post-list",
  () => ({
    __esModule: true,
    PostList: ({
      courseId,
      refetchKey,
      onPostUpdated,
      userRole,
    }: any) => (
      <div data-testid="mock-post-list">
        <span data-testid="list-course">{courseId}</span>
        <span data-testid="list-refetch">{refetchKey}</span>
        <span data-testid="list-role">{userRole}</span>
        <button onClick={onPostUpdated}>Mock Update</button>
      </div>
    ),
  })
);

// Importă componenta reală
import { ClientCoursePage } from "../../../../app/(dashboard)/(routes)/teacher/courses/[courseId]/_components/client-course-page";
describe("ClientCoursePage", () => {
  const mockCourse = {
    id:        "c1",
    userId:    "u1",
    name:      "Curs Test",
    section:   "Secțiune A",
    room:      "Sala 101",
    subject:   "Matematică",
    code:      "MATH101",
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2023-02-01"),
  };

  it("randează subcomponentele cu props‐uri inițiale și incrementează refetchKey la click", () => {
    render(
      <ClientCoursePage
        courseId="c1"
        userId="u1"
        userRole="STUDENT"
        course={mockCourse}
      />
    );

    // 1) CourseCard primește props‐uri corecte
    const courseCard = screen.getByTestId("mock-course-card");
    expect(screen.getByTestId("course-name")).toHaveTextContent("Curs Test");
    expect(screen.getByTestId("current-user")).toHaveTextContent("u1");

    // 2) PostForm primește courseId și apelul onMaterialAdded
    const postForm = screen.getByTestId("mock-post-form");
    expect(screen.getByTestId("form-course")).toHaveTextContent("c1");

    // 3) PostList primește courseId, refetchKey=0, userRole
    const postList = screen.getByTestId("mock-post-list");
    expect(screen.getByTestId("list-course")).toHaveTextContent("c1");
    expect(screen.getByTestId("list-refetch")).toHaveTextContent("0");
    expect(screen.getByTestId("list-role")).toHaveTextContent("STUDENT");

    // 4) Când apăsăm butonul din PostForm → onMaterialAdded → refetchKey devine 1
    fireEvent.click(screen.getByRole("button", { name: "Mock Add" }));
    expect(screen.getByTestId("list-refetch")).toHaveTextContent("1");

    // 5) Când apăsăm butonul din PostList → onPostUpdated → refetchKey devine 2
    fireEvent.click(screen.getByRole("button", { name: "Mock Update" }));
    expect(screen.getByTestId("list-refetch")).toHaveTextContent("2");
  });
});
