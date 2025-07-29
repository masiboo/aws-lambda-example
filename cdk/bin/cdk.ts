#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { CdkStack } from '../lib/cdk-stack';
import { RdsStack } from '../lib/rds-stack';

const app = new cdk.App();

const rdsStack = new RdsStack(app, 'RdsStack');

new CdkStack(app, 'CdkStack', {
  vpc: rdsStack.vpc,
  dbCluster: rdsStack.dbCluster,
  dbCredentialsSecret: rdsStack.dbCredentialsSecret,
});
