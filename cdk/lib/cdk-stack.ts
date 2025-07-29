import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

interface CdkStackProps extends cdk.StackProps {
  vpc: ec2.IVpc;
  dbCluster: rds.IDatabaseInstance;
  dbCredentialsSecret: secretsmanager.ISecret;
}

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: CdkStackProps) {
    super(scope, id, props);

    const javaLambda = new lambda.Function(this, 'JavaLambda', {
      runtime: lambda.Runtime.JAVA_21,
      handler: 'org.example.StreamLambdaHandler::handleRequest',
      code: lambda.Code.fromAsset('../target/aws-lambda-example-1.0-SNAPSHOT.jar'),
      functionName: 'course-api-lambda',
      vpc: props.vpc,
      environment: {
        DB_SECRET_ARN: props.dbCredentialsSecret.secretArn,
        DB_HOST: props.dbCluster.dbInstanceEndpointAddress,
        DB_PORT: props.dbCluster.dbInstanceEndpointPort.toString(),
      },
    });

    props.dbCredentialsSecret.grantRead(javaLambda);
    

    new apigateway.LambdaRestApi(this, 'course-api-demo', {
      handler: javaLambda,
    });
  }
}
