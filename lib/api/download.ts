import type { AxiosResponse } from "axios";

/**
 * Saves a blob response as a file download. The proxy passes non-JSON responses
 * through untouched along with their Content-Disposition, so the backend's own
 * filename is used when it sends one.
 *
 * Call with `responseType: "blob"` on the request, or the body will be a string.
 */
export function downloadBlobResponse(
  response: AxiosResponse,
  fallbackFilename: string
): void {
  const disposition = response.headers["content-disposition"] as
    | string
    | undefined;
  const match = disposition?.match(/filename="?([^"]+)"?/i);
  const filename = match?.[1] ?? fallbackFilename;

  const url = URL.createObjectURL(response.data as Blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
