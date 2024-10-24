#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { Gen3CdkConfigStack } from '../lib/gen3-cdk-config-stack';
import { Gen3BlankParamsStack } from '../lib/parameter-creation-stack';
import { Config, IamRolesConfig, ClusterConfig } from '../lib/config-interfaces';
import { Gen3EnvironmentCredentials } from '../lib/secrets-manager';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';

const app = new cdk.App();

// Get configuration files directory
const configDir = app.node.tryGetContext('configDir') || '../.secrets/config';

// Load AWS JSON configuration
const jsonConfigPath = path.join(__dirname, `${configDir}/config.json`);
const awsConfig = JSON.parse(fs.readFileSync(jsonConfigPath, 'utf-8')) as Config;

// Load IAM roles configuration
const yamlConfigPath = path.join(__dirname, `${configDir}/iamRolesConfig.yaml`);
const iamRolesConfig = yaml.parse(fs.readFileSync(yamlConfigPath, 'utf-8')) as IamRolesConfig;

// Load Cluster configuration
const clusterConfigPath = path.join(__dirname, `${configDir}/clusterConfig.yaml`);
const clusterConfig = yaml.parse(fs.readFileSync(clusterConfigPath, 'utf-8')) as ClusterConfig;

// List of environments to deploy/update
let environments: string[];
try {
  environments = app.node.tryGetContext('environments').split(',');
} catch (error) {
  console.error("**** Caught a TypeError: Did you provide environments? ****");
  throw error;
}

const gen3SSMParameters =  new Gen3BlankParamsStack(app, 'Gen3SSMParameters')

new Gen3CdkConfigStack(app, 'Gen3CdkConfigStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
  awsConfig,
  iamRolesConfig,
  clusterConfig,
  environments
}).addDependency(gen3SSMParameters);

new Gen3EnvironmentCredentials(app, 'Gen3EnvironmentCredentials', {
  environments
})

