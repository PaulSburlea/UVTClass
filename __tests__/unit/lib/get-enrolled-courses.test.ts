import { Classroom } from "../../../app/types/classroom"; 

// 1) Mochează modulul @clerk/nextjs/server
jest.mock("@clerk/nextjs/server", () => ({
  auth: jest.fn(),
}));

// 2) Mochează modulul de bază de date (prisma) sau orice implementare ai în db
jest.mock("../../../lib/db", () => ({
  db: {
    classroom: {
      findMany: jest.fn(),
    },
  },
}));

// După mock-uri, importăm funcția de testat
import { getEnrolledCourses } from "@/lib/get-enrolled-courses";
import { auth } from "@clerk/nextjs/server";
import { db } from "../../../lib/db";

describe("getEnrolledCourses", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returnează lista de cursuri când utilizatorul este autentificat", async () => {
    // 1) Forțăm auth() să returneze un obiect compatibil minim cu Auth
    ((auth as unknown) as jest.Mock).mockResolvedValue({
      userId:           "user-123",
      // celelalte câmpuri nu contează pentru acest test
      sessionId:        "" as any,
      sessionClaims:    {} as any,
      actor:            "" as any,
      orgId:            "" as any,
      redirectToSignIn: () => { throw new Error("should not redirect"); },
    });

    // 2) Mochează db.classroom.findMany să returneze un array de Classroom
    const fakeCourses: Classroom[] = [
      {
        id:        "c1",
        userId:    "user-123",
        name:      "Course 1",
        section:   null,
        room:      null,
        subject:   null,
        code:      "C1",
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-02"),
      },
      {
        id:        "c2",
        userId:    "user-456",
        name:      "Course 2",
        section:   null,
        room:      null,
        subject:   null,
        code:      "C2",
        createdAt: new Date("2024-02-01"),
        updatedAt: new Date("2024-02-02"),
      },
    ];
    ((db.classroom.findMany as unknown) as jest.Mock).mockResolvedValue(fakeCourses);

    const result = await getEnrolledCourses();

    // Verificări
    expect(auth).toHaveBeenCalledTimes(1);
    expect((db.classroom.findMany as jest.Mock).mock.calls[0][0]).toEqual({
      where: {
        users: {
          some: {
            userId: "user-123",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    expect(result).toEqual(fakeCourses);
  });

  it("returnează array gol când auth() nu furnizează userId", async () => {
    ((auth as unknown) as jest.Mock).mockResolvedValue({
      userId:           null,
      sessionId:        "" as any,
      sessionClaims:    {} as any,
      actor:            null as any,
      orgId:            null as any,
      redirectToSignIn: () => { throw new Error("should not redirect"); },
    });

    const result = await getEnrolledCourses();
    expect(db.classroom.findMany).not.toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  it("propagă eroarea dacă db.classroom.findMany eșuează", async () => {
    ((auth as unknown) as jest.Mock).mockResolvedValue({
      userId:           "user-123",
      sessionId:        "" as any,
      sessionClaims:    {} as any,
      actor:            "" as any,
      orgId:            "" as any,
      redirectToSignIn: () => { throw new Error("should not redirect"); },
    });

    ((db.classroom.findMany as unknown) as jest.Mock).mockRejectedValue(new Error("DB error"));

    await expect(getEnrolledCourses()).rejects.toThrow("DB error");
    expect(auth).toHaveBeenCalledTimes(1);
    expect(db.classroom.findMany).toHaveBeenCalledTimes(1);
  });
});
