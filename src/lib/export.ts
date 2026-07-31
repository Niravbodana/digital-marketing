import { jsPDF } from "jspdf";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";

export function exportToPdf(title: string, content: string): Buffer {
  const doc = new jsPDF();
  const lines = doc.splitTextToSize(content, 180);
  doc.setFontSize(18);
  doc.text(title, 14, 20);
  doc.setFontSize(11);
  let y = 35;
  for (const line of lines) {
    if (y > 280) {
      doc.addPage();
      y = 20;
    }
    doc.text(line, 14, y);
    y += 7;
  }
  return Buffer.from(doc.output("arraybuffer"));
}

export async function exportToDocx(title: string, content: string): Promise<Buffer> {
  const paragraphs = content.split("\n").map((line) => {
    if (line.startsWith("# ")) {
      return new Paragraph({ text: line.slice(2), heading: HeadingLevel.HEADING_1 });
    }
    if (line.startsWith("## ")) {
      return new Paragraph({ text: line.slice(3), heading: HeadingLevel.HEADING_2 });
    }
    return new Paragraph({
      children: [new TextRun({ text: line })],
      spacing: { after: 120 },
    });
  });

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({ text: title, heading: HeadingLevel.TITLE }),
          ...paragraphs,
        ],
      },
    ],
  });

  return Buffer.from(await Packer.toBuffer(doc));
}
