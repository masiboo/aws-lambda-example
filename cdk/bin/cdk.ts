#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { DatabaseStack } from '../lib/database-stack';
import { EcsStack } from '../lib/ecs-stack';

const app = new cdk.App();

const databaseStack = new DatabaseStack(app, 'DatabaseStack');

new EcsStack(app, 'EcsStack', {
    vpc: databaseStack.vpc,
    dbCluster: databaseStack.dbCluster,
    dbSecret: databaseStack.dbSecret,
});
