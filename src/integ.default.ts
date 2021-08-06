import { EcrAssetScanner } from "./index";
// import { DockerImageAsset } from "@aws-cdk/aws-ecr-assets";
import * as cdk from "@aws-cdk/core";
import * as ecs from "@aws-cdk/aws-ecs";
// import * as path from "path";

const env = {
  region: process.env.CDK_DEFAULT_REGION,
  account: process.env.CDK_DEFAULT_ACCOUNT,
};

const app = new cdk.App();

export class TestStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Drop in some Docker Image Asset
    // const asset = new DockerImageAsset(this, "whoo", {
    //   directory: path.join(__dirname, "Dockerfile"),
    // });

    // Container Image Asset
    const image = ecs.ContainerImage.fromAsset("./src/", {
      buildArgs: { TEST_VAR: "BAR" },
    });

    const taskDefinition = new ecs.FargateTaskDefinition(
      this,
      "test-task-definition",
      {
        memoryLimitMiB: 2048,
        cpu: 1024,
      }
    );
    taskDefinition.addContainer("container", {
      image,
      environment: {
        TEST_VAR: "BAR",
      },
      logging: new ecs.AwsLogDriver({
        streamPrefix: "testing",
      }),
    });
    // taskDefinition.addContainer("container_two", {
    //   asset,
    //   environment: {
    //     TEST_VAR: "BAR",
    //   },
    //   logging: new ecs.AwsLogDriver({
    //     streamPrefix: "testing",
    //   }),
    // });

    new EcrAssetScanner(this, "test1", {
      assetParameter: "huu",
      assetName: "u",
      severity: "NEVER",
    });
  }
}
new TestStack(app, "test-stack", { env });

// const stack = new TestStack(app, "test-stack", { env });

// Testing outside block scope
// new EcrAssetScanner(stack, "test", {
//   assetParameter: "pog",
//   assetName: "u",
//   severity: "NEVER",
// });
