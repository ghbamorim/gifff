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

resource "aws_cloudfront_distribution" "app" {
  enabled = true

  origin {
    domain_name = aws_instance.app.private_dns
    origin_id   = "gifff-ec2"

    vpc_origin_config {
      vpc_origin_id = aws_cloudfront_vpc_origin.app.id
    }
  }

  default_cache_behavior {
    target_origin_id       = "gifff-ec2"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods         = ["GET", "HEAD"]

    forwarded_values {
      query_string = true

      headers = [
        "If-None-Match",
        "If-Modified-Since"
      ]

      cookies {
        forward = "all"
      }
    }

    min_ttl     = 0
    default_ttl = 0
    max_ttl     = 0

  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }


}

output "cloudfront_url" {
  value = "https://${aws_cloudfront_distribution.app.domain_name}"
}