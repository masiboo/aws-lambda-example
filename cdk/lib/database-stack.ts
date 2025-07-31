import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';

export class DatabaseStack extends cdk.Stack {
  public readonly vpc: ec2.Vpc;
  public readonly dbCluster: rds.DatabaseCluster;
  public readonly dbSecret: secretsmanager.Secret;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.vpc = new ec2.Vpc(this, 'MyVpc', {
      maxAzs: 2,
    });

    this.dbSecret = new secretsmanager.Secret(this, 'DbSecret', {
      secretName: 'my-db-secret',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: 'postgres' }),
        excludePunctuation: true,
        includeSpace: false,
        generateStringKey: 'password',
      },
    });

    this.dbCluster = new rds.DatabaseCluster(this, 'MyDatabase', {
      engine: rds.DatabaseClusterEngine.auroraPostgres({
        version: rds.AuroraPostgresEngineVersion.VER_13_4,
      }),
      credentials: rds.Credentials.fromSecret(this.dbSecret),
      writer: rds.ClusterInstance.provisioned('writer', {
        instanceType: ec2.InstanceType.of(
            ec2.InstanceClass.BURSTABLE2,
            ec2.InstanceSize.SMALL
            ),
      }),
      readers: [
        rds.ClusterInstance.provisioned('reader1', {
            instanceType: ec2.InstanceType.of(
                ec2.InstanceClass.BURSTABLE2,
                ec2.InstanceSize.SMALL
                ),
        })
      ],
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      vpc: this.vpc,
    });
  }
}
