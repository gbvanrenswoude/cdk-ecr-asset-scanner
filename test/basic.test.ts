import * as path from 'path';
import * as cdk from '@aws-cdk/core';
import { ScannedDockerImageAsset } from '../src/index';
import '@aws-cdk/assert/jest';

test('create app', () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app);
  new ScannedDockerImageAsset(stack, 'TestStack', {
    directory: path.join(__dirname, './'),
  });
  expect(stack).toHaveResource('AWS::Lambda::Function');
  expect(stack).toHaveResource('AWS::CloudFormation::CustomResource');
});
