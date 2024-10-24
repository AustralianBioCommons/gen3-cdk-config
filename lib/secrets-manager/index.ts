import { ArgoCdSecretsStack } from "./argocd-credentials";
import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';

interface Gen3EnvironmentCredentialsProps extends cdk.StackProps {
    environments: string[]
}

export class Gen3EnvironmentCredentials extends cdk.Stack {
    constructor(scope: Construct, id: string, props: Gen3EnvironmentCredentialsProps) {
        super(scope, id, props)

        const environments = props.environments

        new ArgoCdSecretsStack(this, 'ArgoCdCredentials', {
            environments
        })
    }
}