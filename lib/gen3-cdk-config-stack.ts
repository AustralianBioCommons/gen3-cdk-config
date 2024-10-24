import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as cr from 'aws-cdk-lib/custom-resources';
import { AwsCustomResourcePolicy, AwsCustomResource } from 'aws-cdk-lib/custom-resources';
import { Config, AwsConfig, IamRolesConfig, ClusterConfig } from './config-interfaces';
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";

interface Gen3CdkConfigStackProps extends cdk.StackProps {
  eventBusName?: string,
  eventRuleEnabled?: boolean,
  env?: cdk.Environment,
  awsConfig: Config,
  iamRolesConfig: IamRolesConfig,
  clusterConfig: ClusterConfig,
  environments: string[]
}


export class Gen3CdkConfigStack extends cdk.Stack {
  
  private ssmClient: SSMClient;
  private readonly gen3ConfigEventBus: events.EventBus;
  private readonly eventRuleEnabled: boolean;

  constructor(scope: Construct, id: string, props?: Gen3CdkConfigStackProps) {
    super(scope, id, props);

    const region = props?.env?.region!;
    const awsConfig = props?.awsConfig!;
    const iamRolesConfig = props?.iamRolesConfig!;
    const clusterConfig = props?.clusterConfig!
    const environments = props?.environments!
    
    this.ssmClient = new SSMClient({ region });

    this.eventRuleEnabled = props?.eventRuleEnabled || true

    const updateConfig = this.node.tryGetContext('update')?.includes('config') || false;

    const configParameterName = '/gen3/config';

    this.handleSsmParameter(configParameterName, JSON.stringify(awsConfig), updateConfig, 'config', '');

    const updateRoles = this.node.tryGetContext('update')?.includes('roles') || false;

    environments.forEach(env => {
      const parameterName = `/gen3/${env}/iamRolesConfig`;
      this.handleSsmParameter(parameterName, JSON.stringify(iamRolesConfig.services[env]), updateRoles, 'iamRoles', env);
    });


    const updateCluster = this.node.tryGetContext('update')?.includes('cluster') || false;
    environments.forEach(env => {
      const parameterName = `/gen3/${env}/cluster-config`;
      this.handleSsmParameter(parameterName, JSON.stringify(clusterConfig.clusters[env]), updateCluster, 'clusterConfig', env);
    });

    // Create a custom Event Bus
    this.gen3ConfigEventBus = new events.EventBus(this, 'Gen3ConfigEventBus', {
      eventBusName: props?.eventBusName ||'gen3Config', 
    });

    // Create EventBridge rules for each environment
    environments.forEach(envName => {
      let env: AwsConfig;
      try {
        env = awsConfig[envName].aws;
      } catch (error) {
        console.error(`Caught a TypeError: Environment: ${envName}`);
        throw error;
      }

      // Create EventBridge rules for each SSM Parameter type,
      // However, we don't want to do for global /gen3/config
      this.createEventBridgeRuleForSSMChange(envName, env, 'cluster-config');
      this.createEventBridgeRuleForSSMChange(envName, env, 'iamRolesConfig');
    });
    
  }

  private async parameterExists(parameterName: string): Promise<boolean> {
    try {
      const command = new GetParameterCommand({ Name: parameterName });
      await this.ssmClient.send(command);
      return true;
    } catch (error) {
      if (error instanceof Error && error.name === 'ParameterNotFound') {
        return false;
      }
      throw error;
    }
  }

  private async handleSsmParameter(parameterName: string, value: string, update: boolean, type: string, env: string) {
    const parameterExists = await this.parameterExists(parameterName);
    if (!parameterExists || update) {
      this.updateSsmParameter(parameterName, value, update, type, env);
    } else {
      console.log(`Skipping ${type} parameter deployment for ${parameterName}`);
    }
  }
  
  private updateSsmParameter(parameterName: string, value: string, update: boolean, type: string, env: string) {
    const ssmConstructId = `${type}SSM${parameterName}${env}`;
    console.log(`${update ? 'Updating' : 'Creating'} SSM Parameter: ${parameterName} with value: ${value}`);

    new AwsCustomResource(this, ssmConstructId, {
      onUpdate: {
        service: 'SSM',
        action: 'putParameter',
        parameters: {
          Name: parameterName,
          Value: value,
          Type: 'String',
          Overwrite: update,
        },
        physicalResourceId: cr.PhysicalResourceId.of(parameterName),
      },
      policy: AwsCustomResourcePolicy.fromStatements([
        new iam.PolicyStatement({
          actions: ['ssm:PutParameter', 'ssm:GetParameter'],
          resources: [`arn:aws:ssm:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:parameter${parameterName}`],
        }),
      ]),
    });
  }

  private createEventBridgeRuleForSSMChange(envName: string, env: AwsConfig, parameterPrefix: string) {
    const ruleId = `${parameterPrefix}-${envName}-forwardingRule`;
    const targetEventBusArn = `arn:aws:events:${env.region}:${env.account}:event-bus/${envName}-gen3-config-eventbus`;
    
    const rule = new events.Rule(this, ruleId, {
      eventBus: this.gen3ConfigEventBus,
      enabled: this.eventRuleEnabled,
      eventPattern: {
        source: ['aws.ssm'],
        detailType: ['Parameter Store Change'],
        detail: {
          name: [`/gen3/${envName}/${parameterPrefix}`],
        },
      },
    });

    rule.addTarget(new targets.EventBus(events.EventBus.fromEventBusArn(
      this, `${ruleId}-event-target`, targetEventBusArn
    )));
  }
}
