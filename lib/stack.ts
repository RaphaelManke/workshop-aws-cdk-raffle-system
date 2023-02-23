import * as cdk from "aws-cdk-lib";
import { LambdaRestApi } from "aws-cdk-lib/aws-apigateway";
import { AttributeType, StreamViewType, Table } from "aws-cdk-lib/aws-dynamodb";
import { Runtime, StartingPosition } from "aws-cdk-lib/aws-lambda";
import { DynamoEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { KafkaCluster } from "./constructs/kafka-serverless-cluster";

export class WorkshopAwsCdkRaffleSystemStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const table = new Table(this, "RaffleTable", {
      partitionKey: {
        name: "id",
        type: AttributeType.STRING,
      },
      stream: StreamViewType.NEW_AND_OLD_IMAGES,
    });

    const kafkaCluster = new KafkaCluster(this, "KafkaCluster", {});

    const streamHandler = kafkaCluster.addProducerLambda(
      "DynamoStreamHandler",
      {
        runtime: Runtime.NODEJS_18_X,
        entry: "lib/lambda/dynamo-stream-handler.ts",
        timeout: cdk.Duration.seconds(30),
      }
    );

    table.grantStreamRead(streamHandler);
    streamHandler.addEventSource(
      new DynamoEventSource(table, {
        startingPosition: StartingPosition.LATEST,
      })
    );

    const lambda = new NodejsFunction(this, "ApiHandlerLambda", {
      runtime: Runtime.NODEJS_18_X,
      entry: "lib/lambda/api-handler.ts",
      environment: {
        TABLE_NAME: table.tableName,
      },
    });

    const api = new LambdaRestApi(this, "RaffleApi", {
      handler: lambda,
      proxy: false,
    });

    api.root.addResource("raffle").addMethod("GET");

    table.grantWriteData(lambda);
  }
}
