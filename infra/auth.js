import cf from "cloudfront";
import crypto from "crypto";

const kvs = cf.kvs();

async function handler(event) {
  const headers = event.request.headers;
  const auth = headers.authorization ? headers.authorization.value : "";
  let expected;
  try {
    expected = await kvs.get("basic_auth_hash");
  } catch (error) {
    return {
      statusCode: 401,
      headers: {
        "www-authenticate": { value: 'Basic realm="gifff"' },
      },
    };
  }

  const actual = crypto.createHash("sha256").update(auth).digest("hex");

  if (expected && actual === expected) {
    return event.request;
  }

  return {
    statusCode: 401,
    statusDescription: "Unauthorized",
    headers: {
      "www-authenticate": { value: 'Basic realm="gifff"' },
      "cache-control": { value: "no-store" },
    },
  };
}
