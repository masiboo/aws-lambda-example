import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

export class RdsStack extends cdk.Stack {
  public readonly vpc: ec2.Vpc;
  public readonly dbCluster: rds.DatabaseInstance;
  public readonly dbCredentialsSecret: secretsmanager.Secret;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.vpc = new ec2.Vpc(this, 'MyVPC');

    this.dbCredentialsSecret = new secretsmanager.Secret(this, 'DBCredentialsSecret', {
      secretName: 'db-credentials',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: 'myuser' }),
        excludePunctuation: true,
        includeSpace: false,
        generateStringKey: 'password',
      },
    });

    this.dbCluster = new rds.DatabaseInstance(this, 'MyDatabase', {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_13
      }),
      vpc: this.vpc,
      credentials: rds.Credentials.fromSecret(this.dbCredentialsSecret),
      databaseName: 'mydatabase',
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
      allocatedStorage: 20,
      publiclyAccessible: true,
    });
  }
}
