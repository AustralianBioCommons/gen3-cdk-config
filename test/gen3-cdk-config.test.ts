import { Template } from 'aws-cdk-lib/assertions';
import * as cdk from 'aws-cdk-lib';
import { Gen3CdkConfigStack } from '../lib/gen3-cdk-config-stack';
import { SSMClient } from '@aws-sdk/client-ssm';

test('Basic Stack Test', () => {
  // TODO: Add more comprehensive tests later
  
  // Given
  const app = new cdk.App();

  // Add context for environments to simulate the deployment environment
  app.node.setContext('environments', 'ci_test'); 
  app.node.setContext('configDir', '../test/config'); 
  app.node.setContext('update', 'config,roles,cluster'); 

  // Mock SSMClient methods to prevent actual AWS calls
  const mockSend = jest.fn();
  (SSMClient.prototype.send as jest.Mock) = mockSend;

  // When
  const stack = new Gen3CdkConfigStack(app, 'TestStack', {
    eventBusName: 'TestEventBus', 
    env: { account: '123456789012', region: 'ap-southeast-2' } 
  });

  // Then
  // Create a template from the stack
  const template = Template.fromStack(stack);
  
  // Assert that the stack contains an EventBus with the specified name
  template.hasResourceProperties('AWS::Events::EventBus', {
    Name: 'TestEventBus'
  });
});
