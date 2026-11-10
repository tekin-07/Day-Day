export const validateExportPassword = (password: string, repeated: string) =>
  password.length >= 10 && password === repeated;
export const backupFileName = (date: string) => `gungun-${date}.gungun`;

export function downloadText(text: string, filename: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "application/octet-stream" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
