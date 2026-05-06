import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/server/auth/jwt";

export const runtime = "nodejs";

const SMMS_API = "https://sm.ms/api/v2/upload";

export async function POST(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json({ statusMessage: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({
      statusCode: 200,
      message: "上传失败",
      error: "无效表单",
    });
  }

  const file = formData.get("file");
  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({
      statusCode: 200,
      message: "上传失败",
      error: "未找到文件",
    });
  }

  const token = process.env.SMMS_TOKEN;
  if (!token) {
    return NextResponse.json({
      statusCode: 200,
      message: "上传失败",
      error: "服务器未配置 SMMS_TOKEN",
    });
  }

  const filename =
    file instanceof File && file.name ? file.name : "upload.jpg";

  try {
    const upstream = new FormData();
    upstream.append("smfile", file, filename);

    const res = await fetch(SMMS_API, {
      method: "POST",
      headers: { Authorization: token },
      body: upstream,
    });

    const json = (await res.json()) as {
      success?: boolean;
      data?: { url?: string };
      message?: string;
    };

    if (json.success && json.data?.url) {
      const url = json.data.url;
      return NextResponse.json({
        statusCode: 200,
        data: { url, imageUrl: url, filename },
      });
    }

    return NextResponse.json({
      statusCode: 200,
      message: "上传失败",
      error: json.message || "SM.MS 上传失败",
    });
  } catch (error: unknown) {
    console.error("上传失败:", error);
    return NextResponse.json({
      statusCode: 200,
      message: "上传失败",
      error: error instanceof Error ? error.message : "系统错误",
    });
  }
}
