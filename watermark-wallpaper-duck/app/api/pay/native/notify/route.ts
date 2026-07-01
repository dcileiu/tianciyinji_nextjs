import { NextResponse } from "next/server";
import { decryptWechatPayResource } from "@/lib/wechat-pay/wechatPay";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const resource = body?.resource || {};
    if (!resource.ciphertext || !resource.nonce) {
      return NextResponse.json({ code: "FAIL", message: "参数不完整" });
    }

    const payment = decryptWechatPayResource({
      associatedData: resource.associated_data || "",
      nonce: resource.nonce,
      ciphertext: resource.ciphertext,
    });

    console.log("[pay/native/notify] decrypted:", payment);

    return NextResponse.json({ code: "SUCCESS", message: "成功" });
  } catch (error) {
    console.error("[pay/native/notify]", error);
    return NextResponse.json({
      code: "FAIL",
      message: error instanceof Error ? error.message : "Native 回调处理失败",
    });
  }
}
