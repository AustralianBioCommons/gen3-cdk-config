# Gen3 CDK Configuration Stack

The `Gen3 CDK Config Stack` is an AWS CDK stack designed to automate the management and creation of configuration entries in the SSM Parameter Store for IAM roles and cluster configurations. By reading settings from JSON and YAML files, it simplifies the handling of sensitive configuration data and EKS cluster settings across multiple environments. This stack provisions IAM role configurations for Gen3 services based on these files, stores AWS platform settings such as VPCs, subnets, and account details in the SSM Parameter Store, and manages EKS cluster configurations in the same way.

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
## Usage Example
`cdk ls --context environments=uat,staging,prod --context update=roles,config,cluster`