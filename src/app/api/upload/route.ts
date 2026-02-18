import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "products";

    if (!file) {
      return NextResponse.json({ error: "No se envió ningún archivo" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Formato no permitido. Usá JPG, PNG o WebP." },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "El archivo es demasiado grande. Máximo 5MB." },
        { status: 400 }
      );
    }

    // Sanitize filename
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpeg";
    const baseName = file.name
      .replace(/\.[^/.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    const timestamp = Date.now();
    const fileName = `${baseName}-${timestamp}.${ext}`;

    // Ensure the folder is safe (only allow "products" or root images)
    const safeFolder = folder === "products" ? "products" : "";
    const relativeDir = safeFolder ? `images/${safeFolder}` : "images";
    const dir = path.join(process.cwd(), "public", relativeDir);

    await mkdir(dir, { recursive: true });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = path.join(dir, fileName);

    await writeFile(filePath, buffer);

    const publicPath = `/${relativeDir}/${fileName}`;

    return NextResponse.json({ path: publicPath });
  } catch {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
