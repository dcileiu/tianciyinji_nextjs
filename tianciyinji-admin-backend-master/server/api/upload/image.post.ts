import { readMultipartFormData } from "h3";
import { requireUser } from "../../utils/auth";

const SMMS_API = "https://sm.ms/api/v2/upload";

export default defineEventHandler(async (event) => {
  // 与原后端一致：上传需要登录
  requireUser(event);

  const form = await readMultipartFormData(event);
  const file = form?.find((f) => f.name === "file");

  if (!file || !file.data) {
    return {
      statusCode: 200,
      message: "上传失败",
      error: "未找到文件",
    };
  }

  const config = useRuntimeConfig();
  const token = config.SMMS_TOKEN as string | undefined;

  if (!token) {
    return {
      statusCode: 200,
      message: "上传失败",
      error: "服务器未配置 SMMS_TOKEN",
    };
  }

  try {
    const blob = new Blob([file.data]);
    const formData = new FormData();
    formData.append("smfile", blob, file.filename || "upload.jpg");

    const res = await fetch(SMMS_API, {
      method: "POST",
      headers: {
        Authorization: token,
      },
      body: formData,
    });

    const json = await res.json();

    if (json.success) {
      const url = json.data.url as string;
      return {
        statusCode: 200,
        data: {
          url,
          imageUrl: url,
          filename: file.filename,
        },
      };
    }

    return {
      statusCode: 200,
      message: "上传失败",
      error: json.message || "SM.MS 上传失败",
    };
  } catch (error: any) {
    console.error("上传失败:", error);
    return {
      statusCode: 200,
      message: "上传失败",
      error: error?.message || "系统错误",
    };
  }
});

