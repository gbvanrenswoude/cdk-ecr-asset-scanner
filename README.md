# CDK ECR Asset Scanner

```sh
cdk --app lib/integ.default.js synth
```

## USAGE

```ts
import { ScannedDockerImageAsset } from "./index";
...

const env = {
  region: process.env.CDK_DEFAULT_REGION,
  account: process.env.CDK_DEFAULT_ACCOUNT,
};

const app = new cdk.App();

export class TestStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Image without scan
    // const image3 = new DockerImageAsset(this, "zzz", {
    //   directory: path.join(__dirname, "../src/"),
    // });

    // Image with scan
    const image = new ScannedDockerImageAsset(this, "zzz", {
      directory: path.join(__dirname, "../src/"),
    });
    const image3 = ecs.ContainerImage.fromDockerImageAsset(image);

    const taskDefinition = new ecs.FargateTaskDefinition(
      this,
      "test-task-definition",
      {
        memoryLimitMiB: 2048,
        cpu: 1024,
      }
    );
    taskDefinition.addContainer("container_example_three", {
      image: image3,
      environment: {
        TEST_VAR: "THREE",
      },
      logging: new ecs.AwsLogDriver({
        streamPrefix: "three",
      }),
    });
  }
}
new TestStack(app, "hh-stack", { env });
```
