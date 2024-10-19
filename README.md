# Gen3 CDK Configuration Stack

The `Gen3CdkConfigStack` is an AWS CDK stack that automates the creation and management of AWS Secrets Manager secrets and SSM Parameter Store entries for IAM roles and cluster configurations. This stack reads configurations from JSON and YAML files, providing an easy way to manage sensitive information and application settings across different environments.

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