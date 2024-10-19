import { Gen3CdkConfigStack } from '../lib/gen3-cdk-config-stack';
import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';

test('should create Secrets Manager secret and SSM parameters', () => {
    const app = new App();

    // Set context values for overwrite flags
    app.node.setContext('overwrite', ['secrets', 'roles', 'cluster']);
    app.node.setContext('environments', ['test', 'staging', 'prod']);

    const stack = new Gen3CdkConfigStack(app, 'TestStack');
    
    // Create an assertions template from the stack
    const template = Template.fromStack(stack);

    console.log(template)

    // Assertions to verify that the Secrets Manager secret and SSM parameters were created

    template.hasResourceProperties('AWS::SecretsManager::Secret', {
        Name: 'gen3/config'
    });

    template.hasResourceProperties('AWS::SSM::Parameter', {
        Name: '/gen3/test/iamRolesConfig'
    });

    template.hasResourceProperties('AWS::SSM::Parameter', {
        Name: '/gen3/staging/iamRolesConfig'
    });

    template.hasResourceProperties('AWS::SSM::Parameter', {
        Name: '/gen3/prod/iamRolesConfig'
    });
});
