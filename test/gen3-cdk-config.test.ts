import * as cdk from 'aws-cdk-lib';
import { App } from 'aws-cdk-lib';
import { Gen3CdkConfigStack } from '../lib/gen3-cdk-config-stack';
import { Template } from 'aws-cdk-lib/assertions';

//TODO: Improve testing

test('SSM Cluster Configuration Parameters Created', () => {
    const app = new App();

    // Set context values 
    app.node.setContext('overwrite', ['secrets', 'roles', 'cluster']);
    app.node.setContext('environments', 'test,staging,prod');
    app.node.setContext('configDir', '../test/config');
    
    const stack = new Gen3CdkConfigStack(app, 'TestStack');

    const template = Template.fromStack(stack);

    // Expected cluster configuration for each environment
    const expectedConfigs = {
        test: {
            version: '1.30',
            minSize: 1,
            maxSize: 2,
            desiredSize: 2,
            diskSize: 100,
            amiReleaseVersion: '1.30.0-20240703',
            instanceType: 'm5.2xlarge',
            tags: {
                Name: 'GEN3 Cluster',
                Type: 'ACDC',
                ENV: 'test',
            },
        },
        staging: {
            version: '1.30',
            minSize: 2,
            maxSize: 3,
            desiredSize: 2,
            diskSize: 100,
            amiReleaseVersion: '1.30.0-20240703',
            instanceType: 'm5.2xlarge',
            tags: {
                Name: 'GEN3 Cluster',
                Type: 'ACDC',
                ENV: 'staging',
            },
        },
        prod: {
            version: '1.30',
            minSize: 2,
            maxSize: 3,
            desiredSize: 2,
            diskSize: 100,
            amiReleaseVersion: '1.30.0-20240703',
            instanceType: 'm5.2xlarge',
            tags: {
                Name: 'GEN3 Cluster',
                Type: 'ACDC',
                ENV: 'prod',
            },
        }
    };

    // Loop through each environment and verify the SSM parameter configuration
    (['test', 'staging', 'prod'] as const).forEach((env) => {
        const expectedValue = JSON.stringify({
            service: 'SSM',
            action: 'putParameter',
            parameters: {
                Name: `/gen3/${env}/cluster-config`,
                Value: JSON.stringify(expectedConfigs[env]),
                Type: 'String',
                Overwrite: true
            },
            physicalResourceId: { id: `/gen3/${env}/cluster-config` }
        });

        // Check the custom resource for SSM parameter creation
        template.hasResourceProperties('Custom::AWS', {
            ServiceToken: { 'Fn::GetAtt': ['AWS679f53fac002430cb0da5b7982bd22872D164C4C', 'Arn'] },
            Create: expectedValue
        });
    });
});
