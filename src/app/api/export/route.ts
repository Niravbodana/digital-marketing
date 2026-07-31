import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { exportToPdf, exportToDocx } from "@/lib/export";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, content, format } = await req.json();
  if (!content) return NextResponse.json({ error: "Content required" }, { status: 400 });

  const safeTitle = (title || "export").replace(/[^a-zA-Z0-9-_ ]/g, "").slice(0, 80);

  if (format === "docx") {
    const buffer = await exportToDocx(safeTitle, content);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${safeTitle}.docx"`,
      },
    });
  }

  const buffer = exportToPdf(safeTitle, content);
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${safeTitle}.pdf"`,
    },
  });
}
