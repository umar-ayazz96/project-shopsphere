module "rds" {
  source  = "terraform-aws-modules/rds/aws"
  version = "~> 7.2"

  identifier = "${var.cluster_name}-postgres"

  engine         = "postgres"
  engine_version = "16"
  family         = "postgres16"

  instance_class = var.db_instance_class

  db_name  = var.db_name
  username = var.db_username
  manage_master_user_password = true
  port     = 5432

  allocated_storage     = 20
  max_allocated_storage = 100
  storage_type          = "gp3"
  storage_encrypted     = true

  # Use the private subnets created by your VPC module
  subnet_ids = module.vpc.private_subnets

  # RDS will only be reachable through this security group
  vpc_security_group_ids = [aws_security_group.rds.id]


  publicly_accessible = false


  auto_minor_version_upgrade = true

  deletion_protection = false
  skip_final_snapshot = true

  tags = {
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "Terraform"
  }
}

# ---------------------------------------------------
# RDS Security Group
# ---------------------------------------------------

resource "aws_security_group" "rds" {
  name        = "${var.cluster_name}-rds-sg"
  description = "Security group for ShopSphere PostgreSQL RDS"
  vpc_id      = var.vpc_id

  tags = {
    Name        = "${var.cluster_name}-rds-sg"
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "Terraform"
  }
}


# ---------------------------------------------------
# Allow PostgreSQL from EKS
# ---------------------------------------------------

resource "aws_vpc_security_group_ingress_rule" "postgres_from_eks" {
  security_group_id = aws_security_group.rds.id

  ip_protocol = "tcp"
  from_port   = 5432
  to_port     = 5432

  referenced_security_group_id = var.eks_security_group_id

  description = "Allow PostgreSQL access from EKS"
}


# ---------------------------------------------------
# Outbound traffic
# ---------------------------------------------------

resource "aws_vpc_security_group_egress_rule" "rds_all_outbound" {
  security_group_id = aws_security_group.rds.id

  ip_protocol = "-1"
  cidr_ipv4   = "0.0.0.0/0"

  description = "Allow outbound traffic"
}