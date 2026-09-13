# ---------------------------------------------------
# EKS Cluster Variables
# ---------------------------------------------------

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

# ---------------------------------------------------
# VPC Variables
# ---------------------------------------------------

variable vpc_name {
    type = string
}

variable vpc_cidr {
    type = string   
}

variable vpc_az {
    type = list(string)
}


variable private_subnets {
  type = list(string)
}

variable public_subnets {
  type = list(string)
}

# ---------------------------------------------------
# RDS Variables
# ---------------------------------------------------

variable "db_name" {
  type = string
}

variable "db_username" {
  type = string
}


variable "db_instance_class" {
  type    = string
}

variable "allocated_storage" {
  type    = number
  default = 20
}

variable "max_allocated_storage" {
  type    = number
  default = 100
}
