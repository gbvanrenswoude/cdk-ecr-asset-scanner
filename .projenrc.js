const { AwsCdkConstructLibrary } = require('projen');
const project = new AwsCdkConstructLibrary({
  author: 'Gijsbert van Renswoude',
  authorAddress: 'gbvanrenswoude@gmail.com',
  cdkVersion: '1.118.0',
  defaultReleaseBranch: 'main',
  name: 'cdk-ecr-asset-scanner',
  repositoryUrl: 'https://github.com/gbvanrenswoude/cdk-ecr-asset-scanner.git',
  cdkDependencies: [
    '@aws-cdk/core',
    '@aws-cdk/aws-iam',
    '@aws-cdk/aws-lambda',
    '@aws-cdk/aws-ecr-assets',
    '@aws-cdk/aws-ecs',
    '@aws-cdk/aws-logs',
  ],
  gitignore: ['cdk.out', 'testss.py'],
  python: {
    distName: 'cdk-ecr-asset-scanner',
    module: 'cdk-ecr-asset-scanner',
  }, // cdkTestDependencies: undefined,    /* AWS CDK modules required for testing. */
  // deps: [],                          /* Runtime dependencies of this module. */
  // description: undefined,            /* The description is just a string that helps people understand the purpose of the package. */
  // devDeps: [],                       /* Build dependencies for this module. */
  // packageName: undefined,            /* The "name" in package.json. */
  // projectType: ProjectType.UNKNOWN,  /* Which type of project this is (library/app). */
  // release: undefined,                /* Add release management to this project. */
});
project.synth();