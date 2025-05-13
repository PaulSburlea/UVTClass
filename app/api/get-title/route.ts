import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");
  if (!url) return NextResponse.json({ error: "Missing URL" }, { status: 400 });

  try {
    const res = await fetch(url);
    const html = await res.text();
    const $ = cheerio.load(html);

    const getMeta = (prop: string) =>
      $(`meta[property='${prop}']`).attr("content") ||
      $(`meta[name='${prop}']`).attr("content") || "";

    return NextResponse.json({
      title: getMeta("og:title") || $("title").text().trim(),
      image: getMeta("og:image"),
      description: getMeta("og:description"),
    });
  } catch {
    return NextResponse.json({ title: null, image: null, description: null });
  }
}
