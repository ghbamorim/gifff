resource "aws_iam_role_policy" "datadog_secret" {
  name = "gifff-datadog-secret-read"
  role = aws_iam_role.ec2.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["secretsmanager:GetSecretValue"]
      Resource = "arn:aws:secretsmanager:us-east-2:242627333067:secret:gifff/datadog/api-key-*"
    }]
  })
}