#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { EcsStack } from '../lib/ecs-stack';
import { RdsStack } from '../lib/rds-stack';
import * as fs from 'fs';

const app = new cdk.App();
const rdsStack = new RdsStack(app, 'RdsStack');
const ecsStack = new EcsStack(app, 'EcsStack');

const rdsSynth = app.synth().getStackArtifact(rdsStack.artifactId).template;
const ecsSynth = app.synth().getStackArtifact(ecsStack.artifactId).template;

fs.writeFileSync('rds-stack.json', JSON.stringify(rdsSynth, null, 2));
fs.writeFileSync('ecs-stack.json', JSON.stringify(ecsSynth, null, 2));
