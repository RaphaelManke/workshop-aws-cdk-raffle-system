# AWS Cloud Development Kit (AWS CDK)

The AWS Cloud Development Kit (AWS CDK) is an open-source software development framework that enables developers to define, provision, and manage cloud infrastructure resources using familiar programming languages. 
It simplifies the process of creating and managing AWS resources by providing high-level, reusable constructs that abstract away the complexities of managing individual services.

**Differences from other Infrastructure as Code tools:**

AWS CDK differs from other Infrastructure as Code (IaC) tools like Terraform, as it leverages familiar programming languages like TypeScript, JavaScript, Python, Java, and C#. 
This allows developers to use their existing skills and knowledge to create and manage cloud infrastructure. 
While Terraform is a popular IaC tool that uses its own domain-specific language called HashiCorp Configuration Language (HCL), AWS CDK brings a more developer-centric approach, making it easier to create reusable components, apply logic and conditions, and integrate with other development tools and libraries.

## Basic Concepts

**Constructs:**

![](https://d2908q01vomqb2.cloudfront.net/da4b9237bacccdf19c0760cab7aec4a8359010b0/2018/12/17/appstack.png)
[source](https://aws.amazon.com/blogs/aws/boost-your-infrastructure-with-cdk/)

Constructs are the building blocks of AWS CDK apps. 
A construct represents a "cloud component" and encapsulates everything AWS CloudFormation needs to create the component. 
Constructs can be as simple as a single resource or as complex as a multi-stack application. 
They can be composed together to create higher-level abstractions.

**CDK Layers:**

AWS CDK organizes constructs into three layers:

![](https://cevo.com.au/wp-content/uploads/2021/09/CDKDiagram.drawio-1.png)
[source](https://cevo.com.au/post/post-cloud-lego-with-the-aws-cdk/)

_Level 1 (L1) constructs:_

These are low-level constructs that provide direct, one-to-one mappings to AWS CloudFormation resources. 
L1 constructs have the same name as the CloudFormation resource they represent, with a "Cfn" prefix, e.g., CfnBucket for an Amazon S3 bucket.

_Level 2 (L2) constructs:_

These are higher-level constructs that provide sensible defaults and convenient methods to simplify the creation of AWS resources.
They are designed to be intuitive for developers and provide an abstraction over the underlying L1 constructs. 
For example, Bucket is an L2 construct for an Amazon S3 bucket that offers a more user-friendly API and comes with sensible default configurations.

_Level 3 (L3) constructs:_ 
These are even higher-level constructs that represent complete, opinionated cloud solutions. 
They are often created by the community or by AWS partners and can be shared and reused across projects. 
L3 constructs can be as simple or as complex as needed, bundling together multiple L1 and L2 constructs to provide fully functional cloud components.

In summary, AWS CDK offers a developer-friendly approach to Infrastructure as Code, utilizing familiar programming languages and providing reusable constructs for defining and managing AWS resources. 
With its layered structure, AWS CDK makes it easier to create and maintain complex cloud applications, promoting collaboration and code reuse.