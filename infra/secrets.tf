resource "aws_secretsmanager_secret" "jwt" {
  name = "gifff/jwt-secret-key"
}

resource "aws_secretsmanager_secret" "admin-password" {
  name = "gifff/initial-user-password"
}