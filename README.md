# Gen3 CDK Configuration Stack

The `Gen3 Cdk Config Stack` is an AWS CDK stack designed to automate the creation and management of secrets in AWS Secrets Manager and entries in SSM Parameter Store for IAM roles and cluster configurations. It reads configuration settings from JSON and YAML files, making it easier to manage sensitive data and application settings across multiple environments. The stack provisions IAM roles for Gen3 services based on these configuration files, stores AWS platform settings (like VPC, subnets, and accounts) in the SSM Parameter Store, and also saves EKS cluster configurations in the Parameter Store.

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
- Loads a JSON configuration from a file and creates a Secrets Manager secret.
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