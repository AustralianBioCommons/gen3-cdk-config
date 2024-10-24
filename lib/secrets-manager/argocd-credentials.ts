import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as sm from 'aws-cdk-lib/aws-secretsmanager';



export interface ArgoCdSecretsProps extends cdk.StackProps {
    environments: string[]
}

export class ArgoCdSecretsStack extends Construct {
    constructor(scope: Construct, id: string, props: ArgoCdSecretsProps) {
        super(scope, id);
        const environments = props.environments

        environments.forEach((envName) => {
            new sm.Secret(
                this,
                `argocdAdmin-${envName}`, {
                    secretName: `argocdAdmin-${envName}`
                }
            )
        })

    }

}