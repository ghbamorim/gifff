resource "aws_cloudfront_key_value_store" "auth" {
  name = "gifff-auth"
}

resource "aws_cloudfront_function" "auth" {
  name    = "gifff-basic-auth"
  runtime = "cloudfront-js-2.0"
  comment = "Basic Auth com SHA-256"
  publish = true

  key_value_store_associations = [
    aws_cloudfront_key_value_store.auth.arn
  ]

  code = file("${path.module}/auth.js")
}

output "auth_kvs_arn" {
  value = aws_cloudfront_key_value_store.auth.arn
}