import * as cdk from "aws-cdk-lib";
import { LambdaRestApi } from "aws-cdk-lib/aws-apigateway";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";

export class WorkshopAwsCdkRaffleSystemStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const lambda = new NodejsFunction(this, "ApiHandlerLambda", {
      runtime: Runtime.NODEJS_18_X,
      entry: "lib/lambda/api-handler.ts",
    });

    const api = new LambdaRestApi(this, "RaffleApi", {
      handler: lambda,
      proxy: false,
    });

    api.root.addResource("raffle").addMethod("GET");
  }
}
