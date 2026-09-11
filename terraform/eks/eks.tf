module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 21.0"

  name               = var.cluster_name
  kubernetes_version = var.kubernetes_version
  iam_role_arn    = "arn:aws:iam::605855663520:role/eksctl-prod-cluster-cluster-ServiceRole-5qmvNy54Gpkt"

  endpoint_private_access = true
  endpoint_public_access  = true

  enabled_log_types = ["api", "audit", "authenticator", "controllerManager", "scheduler"]

  enable_cluster_creator_admin_permissions = true
  enable_irsa                              = true

  vpc_id                   = module.vpc.vpc_id
  subnet_ids               = module.vpc.private_subnets
  control_plane_subnet_ids = module.vpc.private_subnets

  eks_managed_node_groups = {
    default = {
      name           = "default"
      instance_types = var.node_instance_types
      capacity_type  = "ON_DEMAND"

      min_size     = var.min_nodes
      max_size     = var.max_nodes
      desired_size = var.desired_nodes

      update_config = {
        max_unavailable_percentage = 33
      }
    }
  }


  addons = {
    vpc-cni = {
      before_compute = true
      most_recent    = true
    }
    kube-proxy = {
      most_recent = true
    }
    coredns = {
      most_recent = true
    }
    metrics-server = {
      most_recent = true
    }
  }

  tags = {
    Name = var.cluster_name
  }
}