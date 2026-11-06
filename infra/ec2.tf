
data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-2023.*-x86_64"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

resource "aws_instance" "app" {
  ami                         = data.aws_ami.amazon_linux.id
  instance_type               = "t3.micro"
  subnet_id                   = aws_subnet.public.id
  vpc_security_group_ids      = [aws_security_group.ec2.id]
  iam_instance_profile        = aws_iam_instance_profile.ec2.name
  associate_public_ip_address = true

  user_data_replace_on_change = true

  user_data = <<-EOF
    #!/bin/bash
    set -euxo pipefail

    # Install Docker
    dnf install -y docker
    systemctl enable --now docker

    # Install Docker Compose plugin
    COMPOSE_VERSION="v2.40.3"
    ARCH="$(uname -m)"

    mkdir -p /usr/local/lib/docker/cli-plugins

    curl --fail --location --show-error --silent \
      "https://github.com/docker/compose/releases/download/$${COMPOSE_VERSION}/docker-compose-linux-$${ARCH}" \
      --output /usr/local/lib/docker/cli-plugins/docker-compose

    chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

    # Verify installation
    docker --version
    docker compose version
  EOF

  root_block_device {
    volume_size = 20
    volume_type = "gp3"
    encrypted   = true
  }

  tags = {
    Name = "gifff-app"
  }
}

output "ec2_instance_id" {
  value = aws_instance.app.id
}

output "ecr_repository_url" {
  value = aws_ecr_repository.app.repository_url
}

output "rds_endpoint" {
  value = aws_db_instance.main.endpoint
}
