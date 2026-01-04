export type ParsedResponseBody = {
  json: unknown | null;
  text: string;
};

export const parseResponseBody = async (
  response: Response,
): Promise<ParsedResponseBody> => {
  const text = await response.text();
  if (!text) {
    return { json: null, text: "" };
  }

  try {
    return { json: JSON.parse(text), text };
  } catch {
    return { json: null, text };
  }
};

export const getErrorMessage = (
  response: Response,
  body: ParsedResponseBody,
): string => {
  if (body.json && typeof body.json === "object" && "error" in body.json) {
    return String((body.json as { error?: unknown }).error);
  }
  if (body.text) {
    return body.text;
  }
  if (response.statusText) {
    return response.statusText;
  }
  return `Request failed (${response.status})`;
};
