# Gen3 CDK Configuration Stack

The Gen3 Cdk Config Stack is an AWS CDK stack designed to automate the management and creation of secrets in AWS Secrets Manager, as well as entries in SSM Parameter Store for IAM roles and cluster configurations. It reads configuration settings from JSON and YAML files, which simplifies the handling of sensitive data and application settings across different environments. The stack stores IAM role configurations in SSM Parameter Store and maintains AWS platform settings (such as VPC, subnets, and accounts) there, along with EKS cluster configurations. However, this stack does not provision Gen3 Secrets or the IAM roles themselves.

## Table of Contents

- [Overview](#overview)
- [Folder Structure](#folder-structure)
- [Installation](#installation)
- [Configuration Files](#configuration-files)
- [Usage](#usage)
- [Examples](#examples)
- [License](#license)

## Overview

The stack performs the following tasks:
- Loads AWS configuration from a JSON file and creates a secret in AWS Secrets Manager.
- Loads IAM roles configuration from a YAML file and creates corresponding SSM Parameter Store entries for different environments.
- Loads cluster configuration from another YAML file and similarly creates SSM Parameter Store entries for cluster settings.

## Folder Structure

```
gen3-cdk-config
├── .secrets
│   ├── clusterConfig.yaml
│   ├── config.json
│   └── iamRolesConfig.yaml
├── LICENSE
├── README.md
├── bin
│   └── gen3-cdk-config.ts
├── lib
│   └── gen3-cdk-config-stack.ts

```