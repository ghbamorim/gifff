resource "aws_vpc_security_group_egress_rule" "ec2_postgres" {
  security_group_id            = aws_security_group.ec2.id
  referenced_security_group_id = aws_security_group.rds.id
  ip_protocol                  = "tcp"
  from_port                    = 5432
  to_port                      = 5432
}