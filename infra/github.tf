resource "github_actions_secret" "aws_deploy_role" {
  repository      = "gifff"
  secret_name     = "AWS_DEPLOY_ROLE_ARN"
  plaintext_value = aws_iam_role.github_deploy.arn
}