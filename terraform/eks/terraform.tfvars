# EKS

cluster_name = "shopsphere"

kubernetes_version = "1.33"

node_instance_types = ["m7i-flex.large"]

desired_nodes = 2

min_nodes = 1

max_nodes = 3

# RDS

db_name = "shopsphere"

db_username = "shopsphere_admin"

db_instance_class = "db.t3.micro"

allocated_storage = 20

max_allocated_storage = 100

# VPC

vpc_name = "prod-vpc"

vpc_cidr = "10.0.0.0/16"

vpc_az = ["ap-south-1a", "ap-south-1b", "ap-south-1c"]


private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]

public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]


