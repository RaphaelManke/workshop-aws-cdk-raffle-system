import { Stack, StackProps } from "aws-cdk-lib";
import { SecurityGroup, SubnetType, Vpc } from "aws-cdk-lib/aws-ec2";
import { ManagedPolicy, Policy, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { Function, Runtime, StartingPosition } from "aws-cdk-lib/aws-lambda";
import {
  NodejsFunction,
  NodejsFunctionProps,
} from "aws-cdk-lib/aws-lambda-nodejs";
import { CfnServerlessCluster } from "aws-cdk-lib/aws-msk";
import { Construct } from "constructs";

export class KafkaCluster extends Construct {
  public readonly vpc: Vpc;
  public readonly kafkaCluster: CfnServerlessCluster;
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id);
    const { region, account } = Stack.of(this);

    /**
     * Kafka Serverless Cluster
     */
    this.vpc = new Vpc(this, "VPC", {});
    this.kafkaCluster = new CfnServerlessCluster(this, "MyServerlessCluster", {
      clusterName: "MyServerlessClusterPrivate",
      clientAuthentication: {
        sasl: {
          iam: {
            enabled: true,
          },
        },
      },
      vpcConfigs: [
        {
          subnetIds: this.vpc.privateSubnets.map((subnet) => subnet.subnetId),
          securityGroups: [this.vpc.vpcDefaultSecurityGroup],
        },
      ],
    });

    // const rule = new Rule(this, "ProducerRule", {
    //   schedule: Schedule.rate(Duration.minutes(1)),
    //   targets: [new LambdaFunction(lambda), new LambdaFunction(lambda, {})],
    // });
  }
  /**
   * Client Policy
   */
  private clientPolicy = (scope: Construct) => {
    const { region, account } = Stack.of(this);
    return new Policy(scope, "ClientPolicy", {
      statements: [
        new PolicyStatement({
          actions: [
            "kafka-cluster:Connect",
            "kafka-cluster:AlterCluster",
            "kafka-cluster:DescribeCluster",
            "kafka-cluster:DescribeClusterV2",
          ],
          resources: [
            `arn:aws:kafka:${region}:${account}:cluster/${this.kafkaCluster.clusterName}/*`,
          ],
        }),
        new PolicyStatement({
          actions: ["kafka:GetBootstrapBrokers", "kafka:DescribeClusterV2"],
          resources: [
            `arn:aws:kafka:${region}:${account}:cluster/${this.kafkaCluster.clusterName}/*`,
          ],
        }),

        new PolicyStatement({
          actions: [
            "kafka-cluster:*Topic*",
            "kafka-cluster:WriteData",
            "kafka-cluster:ReadData",
          ],
          resources: [
            `arn:aws:kafka:${region}:${account}:topic/${this.kafkaCluster.clusterName}/*`,
          ],
        }),
        new PolicyStatement({
          actions: ["kafka-cluster:AlterGroup", "kafka-cluster:DescribeGroup"],
          resources: [
            `arn:aws:kafka:${region}:${account}:group/${this.kafkaCluster.clusterName}/*`,
          ],
        }),
      ],
    });
  };

  /**
   * Producer
   */
  addProducerLambda = (
    id: string,
    producerLambdaProps: NodejsFunctionProps
  ) => {
    const lambda = new NodejsFunction(this, id, {
      ...producerLambdaProps,
      vpc: this.vpc,
      vpcSubnets: {
        subnetType: SubnetType.PRIVATE_WITH_EGRESS,
      },
      securityGroups: [
        SecurityGroup.fromSecurityGroupId(
          this,
          "defaultSg",
          this.vpc.vpcDefaultSecurityGroup
        ),
      ],
      environment: {
        ...producerLambdaProps.environment,
        MSK_CLUSTER_ARN: this.kafkaCluster.attrArn,
      },
    });
    const policy = this.clientPolicy(lambda);
    policy.attachToRole(lambda.role!);
    return lambda;
  };
  /**
   * Consumer
   */
  addConsumer = (consumerLambda: Function, topic: string) => {
    //   const role = new Role(this, "ClientRole", {
    //     assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
    //   });
    //   clientPolicy.attachToRole(role);
    const policy = this.clientPolicy(consumerLambda);
    policy.attachToRole(consumerLambda.role!);
    consumerLambda.role?.addManagedPolicy(
      ManagedPolicy.fromManagedPolicyArn(
        consumerLambda,
        "MSKExecutionRole",
        "arn:aws:iam::aws:policy/service-role/AWSLambdaMSKExecutionRole"
      )
    );

    consumerLambda.addEventSourceMapping("EventSourceMapping", {
      eventSourceArn: this.kafkaCluster.attrArn,
      startingPosition: StartingPosition.TRIM_HORIZON,
      batchSize: 10,
      enabled: true,
      kafkaTopic: topic,
    });
  };
}
