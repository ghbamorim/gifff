variable "acm_certificate_arn" {
  type = string
}

variable "ec2_ami_id" {
  description = "Pinned Amazon Linux 2023 AMI for the application EC2 instance"
  type        = string
  default     = "ami-04f3a1f74e68b4cae"
}