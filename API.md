# API Reference <a name="API Reference"></a>

## Constructs <a name="Constructs"></a>

### ScannedDockerImageAsset <a name="cdk-ecr-asset-scanner.ScannedDockerImageAsset"></a>

#### Initializers <a name="cdk-ecr-asset-scanner.ScannedDockerImageAsset.Initializer"></a>

```typescript
import { ScannedDockerImageAsset } from 'cdk-ecr-asset-scanner'

new ScannedDockerImageAsset(scope: Construct, id: string, props: DockerImageAssetProps)
```

##### `scope`<sup>Required</sup> <a name="cdk-ecr-asset-scanner.ScannedDockerImageAsset.parameter.scope"></a>

- *Type:* [`@aws-cdk/core.Construct`](#@aws-cdk/core.Construct)

---

##### `id`<sup>Required</sup> <a name="cdk-ecr-asset-scanner.ScannedDockerImageAsset.parameter.id"></a>

- *Type:* `string`

---

##### `props`<sup>Required</sup> <a name="cdk-ecr-asset-scanner.ScannedDockerImageAsset.parameter.props"></a>

- *Type:* [`@aws-cdk/aws-ecr-assets.DockerImageAssetProps`](#@aws-cdk/aws-ecr-assets.DockerImageAssetProps)

---



#### Properties <a name="Properties"></a>

##### `scanCRHandler`<sup>Required</sup> <a name="cdk-ecr-asset-scanner.ScannedDockerImageAsset.property.scanCRHandler"></a>

```typescript
public readonly scanCRHandler: CustomResource;
```

- *Type:* [`@aws-cdk/core.CustomResource`](#@aws-cdk/core.CustomResource)

---

##### `scanFunction`<sup>Required</sup> <a name="cdk-ecr-asset-scanner.ScannedDockerImageAsset.property.scanFunction"></a>

```typescript
public readonly scanFunction: SingletonFunction;
```

- *Type:* [`@aws-cdk/aws-lambda.SingletonFunction`](#@aws-cdk/aws-lambda.SingletonFunction)

---





