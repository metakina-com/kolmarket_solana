import { NextRequest, NextResponse } from "next/server";
import { agentSuiteManager } from "@/lib/agents/agent-suite";
import { isContainerEnabled, containerTwitter } from "@/lib/agents/container-client";

// 如果配置了容器 URL，使用 Edge Runtime（调用容器 API）
// 否则使用 Node.js Runtime（直接运行插件）
// 注意：Next.js 不支持条件表达式，所以这里固定为 edge
// 如果使用容器，设置为 edge；如果不使用容器，需要改为 nodejs
export const runtime = "edge"; // 使用容器时
// export const runtime = "nodejs"; // 不使用容器时

/**
 * POST /api/agent-suite/avatar
 * 手动触发发推
 * 
 * 如果配置了 ELIZAOS_CONTAINER_URL，会调用容器 API
 * 否则使用本地 Agent Suite Manager
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { suiteId, content, kolName, description, autoPost, autoInteract } = body;

    if (!suiteId || !content) {
      return NextResponse.json(
        { error: "suiteId and content are required" },
        { status: 400 }
      );
    }

    // 如果配置了容器，优先使用容器
    if (isContainerEnabled()) {
      try {
        const tweetId = await containerTwitter.postTweet(suiteId, content, {
          name: kolName,
          description,
          autoPost,
          autoInteract,
        });

        return NextResponse.json({
          success: true,
          tweetId,
          message: "Tweet posted successfully via container",
        });
      } catch (containerError) {
        console.error("Container API error, falling back to local:", containerError);
        // 降级到本地实现
      }
    }

    // 使用本地 Agent Suite Manager（降级实现）
    const tweetId = await agentSuiteManager.postTweet(suiteId, content);

    return NextResponse.json({
      success: true,
      tweetId,
      message: "Tweet posted successfully",
    });
  } catch (error) {
    console.error("Avatar API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to post tweet" },
      { status: 500 }
    );
  }
}
