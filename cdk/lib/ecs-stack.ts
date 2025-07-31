import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecs_patterns from 'aws-cdk-lib/aws-ecs-patterns';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { DockerImageAsset } from 'aws-cdk-lib/aws-ecr-assets';
import * as path from 'path';

interface EcsStackProps extends cdk.StackProps {
  vpc: ec2.Vpc;
  dbCluster: rds.DatabaseCluster;
  dbSecret: secretsmanager.Secret;
}

export class EcsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: EcsStackProps) {
    super(scope, id, props);

    const cluster = new ecs.Cluster(this, 'MyCluster', {
      vpc: props.vpc,
    });

    const image = new DockerImageAsset(this, 'MyDockerImage', {
        directory: path.join(__dirname, '..', '..'),
    });

    const service = new ecs_patterns.ApplicationLoadBalancedFargateService(this, 'MyFargateService', {
      cluster: cluster,
      cpu: 256,
      desiredCount: 1,
      taskImageOptions: {
        image: ecs.ContainerImage.fromDockerImageAsset(image),
        containerPort: 8080,
        environment: {
          SPRING_DATASOURCE_URL: `jdbc:postgresql://${props.dbCluster.clusterEndpoint.hostname}:${props.dbCluster.clusterEndpoint.port}/postgres`,
          SPRING_DATASOURCE_USERNAME: props.dbSecret.secretValueFromJson('username').toString(),
          SPRING_DATASOURCE_PASSWORD: props.dbSecret.secretValueFromJson('password').toString(),
        },
        secrets: {
            SPRING_DATASOURCE_USERNAME: ecs.Secret.fromSecretsManager(props.dbSecret, 'username'),
            SPRING_DATASOURCE_PASSWORD: ecs.Secret.fromSecretsManager(props.dbSecret, 'password'),
        }
      },
      memoryLimitMiB: 512,
      publicLoadBalancer: true,
    });

    props.dbCluster.connections.allowDefaultPortFrom(service.service.connections);
  }
}
