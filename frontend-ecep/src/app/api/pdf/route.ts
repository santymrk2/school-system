import { NextRequest, NextResponse } from "next/server";

const DEFAULT_HTMLDOCS_ENDPOINT = "https://api.htmldocs.com/v1/documents";

const getEnv = (name: string) => process.env[name];

const getHtmlDocsHeaders = () => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/pdf",
  };
  const apiKey = getEnv("HTMLDOCS_API_KEY") ?? getEnv("NEXT_PUBLIC_HTMLDOCS_API_KEY");
  const bearer = getEnv("HTMLDOCS_BEARER_TOKEN");
  const workspace = getEnv("HTMLDOCS_WORKSPACE_ID");

  if (apiKey) {
    headers["X-API-Key"] = apiKey;
  }

  if (bearer) {
    headers.Authorization = `Bearer ${bearer}`;
  } else if (!apiKey) {
    throw new Error(
      "No se encontró una clave de acceso para HTMLDocs (variable HTMLDOCS_API_KEY o HTMLDOCS_BEARER_TOKEN).",
    );
  }

  if (workspace) {
    headers["X-Workspace-Id"] = workspace;
  }

  return headers;
};

type RequestPayload = {
  html?: string;
  title?: string;
  fileName?: string;
};

export async function POST(request: NextRequest) {
  let payload: RequestPayload;
  try {
    payload = (await request.json()) as RequestPayload;
  } catch {
    return NextResponse.json(
      { error: "No se pudo interpretar la solicitud enviada." },
      { status: 400 },
    );
  }

  const { html, title, fileName } = payload;

  if (!html || typeof html !== "string") {
    return NextResponse.json(
      { error: "El contenido HTML es obligatorio para generar el PDF." },
      { status: 400 },
    );
  }

  const resolvedTitle = typeof title === "string" && title.trim().length > 0 ? title : "Documento";
  const resolvedFileName =
    typeof fileName === "string" && fileName.trim().length > 0 ? fileName : "documento.pdf";

  let headers: Record<string, string>;
  try {
    headers = getHtmlDocsHeaders();
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "No se pudo preparar la autenticación con HTMLDocs.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const endpoint = (getEnv("HTMLDOCS_API_URL") ?? DEFAULT_HTMLDOCS_ENDPOINT).replace(/\/$/, "");
  const pipeline = getEnv("HTMLDOCS_PIPELINE_ID");

  const upstreamBody = pipeline
    ? {
        pipeline,
        input: {
          html,
          meta: {
            title: resolvedTitle,
          },
        },
      }
    : {
        document: {
          html,
          meta: {
            title: resolvedTitle,
          },
        },
        output: {
          type: "pdf",
        },
      };

  try {
    const upstreamResponse = await fetch(`${endpoint}${pipeline ? "/pipelines/run" : ""}`, {
      method: "POST",
      headers,
      body: JSON.stringify(upstreamBody),
    });

    if (!upstreamResponse.ok) {
      let errorMessage = "El servicio de HTMLDocs rechazó la solicitud.";
      try {
        const data = await upstreamResponse.json();
        if (typeof data?.error === "string") {
          errorMessage = data.error;
        } else if (typeof data?.message === "string") {
          errorMessage = data.message;
        }
      } catch {
        const text = await upstreamResponse.text();
        if (text) {
          errorMessage = text;
        }
      }

      return NextResponse.json({ error: errorMessage }, { status: upstreamResponse.status });
    }

    const buffer = await upstreamResponse.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": String(buffer.byteLength),
        "Cache-Control": "no-store",
        "Content-Disposition": `attachment; filename="${resolvedFileName}"`,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "No se pudo conectar con el servicio de HTMLDocs.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
