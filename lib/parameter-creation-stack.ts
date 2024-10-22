import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ssm from 'aws-cdk-lib/aws-ssm';


export class Gen3BlankParamsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    let envName: string[];
    try {
        envName = this.node.tryGetContext('environments').split(',');
    } catch (error) {
      console.error("**** Caught a TypeError: Did you provide environments? ****");
      throw error;
    }

    // Create blank parameters for each environment dynamically
    envName.forEach(env => {
      new ssm.StringParameter(this, `IamRolesConfigParam-${env}`, {
        parameterName: `/gen3/${env}/iamRolesConfig`,
        stringValue: '0',  // Initially empty
      });

      new ssm.StringParameter(this, `ClusterConfigParam-${env}`, {
        parameterName: `/gen3/${env}/cluster-config`,
        stringValue: '0',  // Initially empty
      });
    });

    // Create the global config parameter
    new ssm.StringParameter(this, 'ConfigParam', {
      parameterName: '/gen3/config',
      stringValue: '0',  // Initially empty
    });
  }
}
