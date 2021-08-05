import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import * as iam from "@aws-cdk/aws-iam";
// import { DockerImageAsset } from "@aws-cdk/aws-ecr-assets";
import * as path from "path";

// Detect all DockerImageAsset in a stack
// run an cr on them
// generate outputs on the results

/**
 * @summary The properties for the EcrAssetScanner Construct
 */
export interface EcrAssetScannerProps {
  /**
   * Optional user provided property to break the deploy and force a rollback based on the vulnerability severity found. NEVER never breaks the deploy.
   * Options are 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'NEVER'
   * Defaults to 'NEVER'
   *
   * @default - 'NEVER'
   */
  readonly severity: string;
  /**
   * Friendly name of the asset for readability purposes
   *
   * @default - None
   */
  readonly assetName: string;
  /**
   * Asset parameter name
   *
   * @default - None
   */
  readonly assetParameter: string; // DockerImageAsset;
}

export class EcrAssetScanner extends cdk.Construct {
  /**
   * @summary Constructs a new instance of the EcrAssetScanner class.
   * @param {cdk.App} scope - represents the scope for all the resources.
   * @param {string} id - this is a a scope-unique id.
   * @param {EcrAssetScannerProps} props - user provided props for the construct
   * @access public
   */

  public readonly scanFunction: lambda.SingletonFunction;
  public readonly scanCRHandler: cdk.CustomResource;

  constructor(scope: cdk.Construct, id: string, props: EcrAssetScannerProps) {
    super(scope, id);

    this.scanFunction = new lambda.SingletonFunction(this, `scanFunction`, {
      uuid: "staticuuid",
      runtime: lambda.Runtime.PYTHON_3_8,
      code: lambda.Code.fromAsset(path.join(__dirname, "../function")),
      handler: "index.handler",
      environment: {
        T: props.assetParameter,
        N: props.assetName,
        C: props.severity,
      },
    });
    this.scanFunction.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["ecr:*", "logs:*"],
        resources: ["*"],
      })
    );

    this.scanCRHandler = new cdk.CustomResource(this, `scanCR`, {
      serviceToken: this.scanFunction.functionArn,
    });
  }
}
