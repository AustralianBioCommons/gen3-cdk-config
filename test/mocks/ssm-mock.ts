import { SSMClient } from '@aws-sdk/client-ssm';

// Mock implementation of the SSM Client
export const mockSSMClient = {
  send: jest.fn((command: any) => {
    if (command.input.Name === '/gen3/uat/iamRolesConfig') {
      return Promise.resolve({
        Parameter: {
          Name: '/gen3/uat/iamRolesConfig',
          Value: 'mockValue',
          Type: 'String',
        },
      });
    }
    // Handle other commands or throw an error for undefined parameters
    throw new Error('Parameter not found');
  }),
};

// Replace the actual SSM client with the mock client in your stack
jest.mock('@aws-sdk/client-ssm', () => {
  return {
    SSMClient: jest.fn(() => mockSSMClient),
  };
});
