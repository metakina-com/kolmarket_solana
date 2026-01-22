import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

interface Env {
    AI: any;
    VECTORIZE: any;
}

export async function POST(req: NextRequest) {
    try {
        const env = (process.env as unknown) as Env;

        // Check for bindings
        if (!env.AI || !env.VECTORIZE) {
            console.warn("AI or VECTORIZE binding missing. Defaulting to simulation mode.");
            return NextResponse.json({
                success: true,
                simulated: true,
                message: "Indexing simulated (CF Bindings not found in local dev)"
            });
        }

        const formData = await req.formData();
        const file = formData.get('file') as File;
        const text = formData.get('text') as string;
        const fileName = file?.name || "Manual Input";

        let content = text;
        if (file) {
            content = await file.text();
        }

        if (!content) {
            return NextResponse.json({ error: "No content provided" }, { status: 400 });
        }

        // 1. Simple Chunking (512 characters with 50 overlap)
        const chunkSize = 512;
        const overlap = 50;
        const chunks: string[] = [];

        for (let i = 0; i < content.length; i += (chunkSize - overlap)) {
            chunks.push(content.substring(i, i + chunkSize));
            if (i + chunkSize >= content.length) break;
        }

        // 2. Generate Embeddings using Workers AI
        // Using @cf/baai/bge-small-en-v1.5 as it's efficient for RAG
        const model = '@cf/baai/bge-small-en-v1.5';

        const embeddingsResponse = await env.AI.run(model, {
            text: chunks
        });

        const vectors = embeddingsResponse.data;

        // 3. Store in Vectorize
        const upsertData = vectors.map((vector: number[], i: number) => ({
            id: `${fileName.replace(/\s+/g, '_')}-${i}`,
            values: vector,
            metadata: {
                fileName,
                text: chunks[i],
                chunkIndex: i
            }
        }));

        await env.VECTORIZE.upsert(upsertData);

        return NextResponse.json({
            success: true,
            fileName,
            chunks: chunks.length,
            message: `Successfully indexed ${chunks.length} neural vectors into Cortex.`
        });

    } catch (error: any) {
        console.error("Cortex Indexing Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
