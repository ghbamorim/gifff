resource "aws_cloudfront_vpc_origin" "app" {
  vpc_origin_endpoint_config {
    name                   = "gifff-ec2-${aws_instance.app.id}"
    arn                    = aws_instance.app.arn
    http_port              = 80
    https_port             = 443
    origin_protocol_policy = "http-only"

    origin_ssl_protocols {
      items    = ["TLSv1.2"]
      quantity = 1
    }
  }

  lifecycle {
    create_before_destroy = true
    replace_triggered_by  = [aws_instance.app]
  }
}