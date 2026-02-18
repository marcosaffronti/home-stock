export async function uploadImage(file: File, folder: string = "products"): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Error al subir imagen" }));
    throw new Error(err.error || "Error al subir imagen");
  }

  const data = await res.json();
  return data.path;
}
