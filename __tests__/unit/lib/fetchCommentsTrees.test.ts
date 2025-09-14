import { fetchCommentsTree, CommentNode } from "@/lib/fetchCommentsTrees";
// Supradefinim global.fetch
declare let global: any;

describe("fetchCommentsTree", () => {
  const postId = "post-123";

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("recuperează corect arborele de comentarii cu un singur nivel de răspunsuri", async () => {
    // Simulăm două comentarii de top-level
    const rootComments: CommentNode[] = [
      { id: "c1", content: "Root 1", createdAt: "2023-01-01", authorId: "a1" },
      { id: "c2", content: "Root 2", createdAt: "2023-01-02", authorId: "a2" },
    ];
    // Pentru fiecare root, simulăm un răspuns cu două copii
    const repliesForC1: CommentNode[] = [
      { id: "c1r1", content: "Reply 1 to C1", createdAt: "2023-01-03", authorId: "b1" },
      { id: "c1r2", content: "Reply 2 to C1", createdAt: "2023-01-04", authorId: "b2" },
    ];
    const repliesForC2: CommentNode[] = [
      { id: "c2r1", content: "Reply 1 to C2", createdAt: "2023-01-05", authorId: "c1" },
    ];

    // Pregătim mock‐urile pentru fetch
    // 1) Prima apelare: /api/comments?postId=post-123    → rootComments
    // 2) A doua apelare: /api/comments?postId=post-123&parentCommentId=c1 → repliesForC1
    // 3) A treia apelare: /api/comments?postId=post-123&parentCommentId=c2 → repliesForC2
    // 4) Pentru fiecare reply, nu mai există răspunsuri (listă goală)
    const fetchMock = jest.fn()
      // apel root comments
      .mockResolvedValueOnce({ ok: true, json: async () => rootComments })
      // reapel pentru c1
      .mockResolvedValueOnce({ ok: true, json: async () => repliesForC1 })
      // reapel pentru c2
      .mockResolvedValueOnce({ ok: true, json: async () => repliesForC2 })
      // reacel pentru c1r1 (fără copii)
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      // reacel pentru c1r2 (fără copii)
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      // reacel pentru c2r1 (fără copii)
      .mockResolvedValueOnce({ ok: true, json: async () => [] });

    global.fetch = fetchMock;

    const tree = await fetchCommentsTree(postId);

    // Verificăm structura de bază
    expect(tree).toHaveLength(2);

    expect(tree[0].id).toBe("c1");
    expect(tree[0].replies).toBeDefined();
    expect(tree[0].replies).toHaveLength(2);
    expect(tree[0].replies![0].id).toBe("c1r1");
    expect(tree[0].replies![1].id).toBe("c1r2");
    // Mai jos verficăm că acei copii n-au la rândul lor sub‐replies
    expect(tree[0].replies![0].replies).toEqual([]);
    expect(tree[0].replies![1].replies).toEqual([]);

    expect(tree[1].id).toBe("c2");
    expect(tree[1].replies).toBeDefined();
    expect(tree[1].replies).toHaveLength(1);
    expect(tree[1].replies![0].id).toBe("c2r1");
    expect(tree[1].replies![0].replies).toEqual([]);

    // Verificăm câte apeluri la fetch s-au făcut și cu ce URL-uri
    expect(fetchMock).toHaveBeenCalledTimes(6);
    expect(fetchMock.mock.calls[0][0]).toBe(`/api/comments?postId=${postId}`);
    expect(fetchMock.mock.calls[1][0]).toBe(
      `/api/comments?postId=${postId}&parentCommentId=c1`
    );
    expect(fetchMock.mock.calls[2][0]).toBe(
      `/api/comments?postId=${postId}&parentCommentId=c2`
    );
  });

  it("aruncă eroare dacă primul fetch dă `res.ok = false`", async () => {
    const fetchMock = jest.fn().mockResolvedValue({ ok: false });
    global.fetch = fetchMock;

    await expect(fetchCommentsTree(postId)).rejects.toThrow(
      "Failed to fetch root comments"
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("aruncă eroare dacă vreun fetch de răspunsuri dă `res.ok = false`", async () => {
    // root este ok, dar fetch pentru replies pentru c1 respinge
    const rootComments: CommentNode[] = [
      { id: "c1", content: "Root", createdAt: "2023-01-01" },
    ];
    const fetchMock = jest.fn()
      // root
      .mockResolvedValueOnce({ ok: true, json: async () => rootComments })
      // răspuns pentru c1
      .mockResolvedValueOnce({ ok: false });

    global.fetch = fetchMock;
    await expect(fetchCommentsTree(postId)).rejects.toThrow(
      "Failed to fetch replies for c1"
    );
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
