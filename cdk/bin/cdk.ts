#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { LambdaStack } from '../lib/lambda-stack';
import { RdsStack } from '../lib/rds-stack';

const app = new cdk.App();

const rdsStack = new RdsStack(app, 'RdsStack');

new LambdaStack(app, 'LambdaStack', {
  vpc: rdsStack.vpc,
  dbCluster: rdsStack.dbCluster,
  dbCredentialsSecret: rdsStack.dbCredentialsSecret,
});
