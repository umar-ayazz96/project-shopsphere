terraform {
    
    required_providers {
    aws = {
      source  = "hashicorp/aws"
         }
    }
    required_version = ">= 1.0"
  
}


#Setting up the AWS Region
provider "aws" {
        region = "ap-south-1"
}