import * as cdk from 'aws-cdk-lib';
import { StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';


interface IamRoleConfig {
  serviceName: string;
  policies: string[]; 
}

interface IamRolesConfig {
  services: { [key: string]: { [key: string]: IamRoleConfig[] } };
}

interface ClusterConfigDetails {
  version: string;
  minSize: number;
  maxSize: number;
  desiredSize: number;
  diskSize: number;
  amiReleaseVersion: string;
  instanceType: string;
  tags: Record<string, string>;
}

interface ClusterConfig {
  clusters: { [key: string]: ClusterConfigDetails };
}


export class Gen3CdkConfigStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Determine the environment configuration paths
    const configDir = this.node.tryGetContext('configDir') || '../.secrets/config';

    // Load JSON configuration for Secrets Manager
    const jsonConfigPath = path.join(__dirname, `${configDir}/config.json`);
    const jsonConfig = JSON.parse(fs.readFileSync(jsonConfigPath, 'utf-8'));

    const overwriteSecrets = this.node.tryGetContext('overwrite')?.includes('secrets');

    // Create or update the Secrets Manager secret for the configuration based on overwriteSecrets
    if (overwriteSecrets || !secretsmanager.Secret.fromSecretNameV2(this, 'Gen3ConfigSecret', 'gen3/config')) {
      new secretsmanager.Secret(this, 'Gen3ConfigSecret', {
        secretName: 'gen3/config',
        secretStringValue: cdk.SecretValue.unsafePlainText(JSON.stringify(jsonConfig)),
        // Safeguard against deletion
        removalPolicy: cdk.RemovalPolicy.RETAIN,
      });
    }

    // Load IAM roles configuration from YAML file
    const yamlConfigPath = path.join(__dirname, `${configDir}/iamRolesConfig.yaml`);
    const rolesConfig: IamRolesConfig = yaml.parse(fs.readFileSync(yamlConfigPath, 'utf-8')) as IamRolesConfig;

    // Retrieve environments from context or default to 'dev' and 'prod'
    const environments = this.node.tryGetContext('environments') || ['test', 'staging', 'prod'];
    const overwriteRoles = this.node.tryGetContext('overwrite')?.includes('roles');

    // Create SSM Parameter Store entries for each environment with YAML config
    for (const env of environments) {
      this.createSsmParameter(`/gen3/${env}/iamRolesConfig`, JSON.stringify(rolesConfig.services[env]), env, overwriteRoles, 'iamRoles');
    }

    // Load Cluster configuration from YAML file
    const clusterConfigPath = path.join(__dirname, `${configDir}/clusterConfig.yaml`);
    const clusterConfig: ClusterConfig = yaml.parse(fs.readFileSync(clusterConfigPath, 'utf-8')) as ClusterConfig;

    // Create SSM Parameter Store entries for cluster configuration
    const overwriteCluster = this.node.tryGetContext('overwrite')?.includes('cluster');

    for (const env of environments) {
      this.createSsmParameter(`/gen3/${env}/cluster-config`, JSON.stringify(clusterConfig.clusters[env]), env, overwriteCluster, 'clusterConfig');
    }
  }

  private createSsmParameter(parameterName: string, value: string, environment: string, overwrite: boolean, type: string) {
    const paramConstructId = `${type}${environment.charAt(0).toUpperCase()}`;
    const ssmConstructId = `${type}SSM${environment.charAt(0).toUpperCase()}`;

    // Check if we need to create or update the SSM Parameter
    const currentParameter = ssm.StringParameter.fromStringParameterAttributes(this, paramConstructId, {
      parameterName
    });

    if (overwrite || !currentParameter) {
      new ssm.StringParameter(this, ssmConstructId, {
        parameterName,
        stringValue: value,
        tier: ssm.ParameterTier.ADVANCED,
        dataType: ssm.ParameterDataType.TEXT,
        description: `Configuration for ${parameterName.split('/').pop()}`,
      }).applyRemovalPolicy(cdk.RemovalPolicy.RETAIN);
    }
  }
}
