variable "aws_region" {
  type    = string
  default = "us-west-2"
}

variable "first_superuser_email" {
  type    = string
  default = "admin@qlcayxanh.com"
}

variable "bucket_name" {
  type        = string
  description = "Name of the S3 bucket for the web frontend"
}


