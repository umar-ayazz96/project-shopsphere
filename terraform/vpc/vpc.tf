module "vpc" {
  source = "terraform-aws-modules/vpc/aws"

  name = "${var.cluster_name}-vpc"
  cidr = var.vpc_cidr

  azs             = var.vpc_az
  private_subnets = var.private_subnets
  public_subnets  = var.public_subnets

  enable_nat_gateway    = true
  one_nat_gateway_per_az = true
  enable_vpn_gateway = true

  public_subnet_tags = {
    "kubernetes.io/role/elb" = "1"
  }

  private_subnet_tags = {
    "kubernetes.io/role/internal-elb" = "1"
  }

  tags = {

    Environment = "production"
  }
}