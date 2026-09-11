variable vpc_name {
    type = string
}

variable vpc_cidr {
    type = string   
}

variable vpc_az {
    type = list(string)
}

variable cluster_name {
    type = string
}

variable "kubernetes_version" {
  description = "Kubernetes version"
  type        = string
}


variable "node_instance_types" {
  description = "EC2 instance types for EKS nodes"
  type        = list(string)
}

variable "desired_nodes" {
  description = "Desired number of worker nodes"
  type        = number
}

variable "min_nodes" {
  description = "Minimum worker nodes"
  type        = number
}

variable "max_nodes" {
  description = "Maximum worker nodes"
  type        = number
}

variable private_subnets {
  type = list(string)
}

variable public_subnets {
  type = list(string)
}

variable db_password {
  type = string
}