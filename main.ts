// Copyright (c) HashiCorp, Inc
// SPDX-License-Identifier: MPL-2.0
import { Construct, IConstruct } from "constructs";
import { App, TerraformOutput, TerraformStack } from "cdktf";
import { execSync } from "child_process";
import { Pet } from "@cdktf/provider-random/lib/pet";
import { RandomProvider } from "@cdktf/provider-random/lib/provider";

type MyConfig = {
  prefix: string;
  gitSha: string;
  // ... other typed config values
};

const COMMON_CONFIG_SYMBOL = Symbol("@myorg/cdktf-common-config");
class CommonConfig {
  private constructor(private config: MyConfig) {}

  static set(scope: IConstruct, config: MyConfig) {
    (scope as any)[COMMON_CONFIG_SYMBOL] = new CommonConfig(config);
  }

  public static of(scope: IConstruct): MyConfig {
    // find node with CommonConfig attached going upwards from the child (thus reverse())
    let cc = (
      scope.node.scopes
        .reverse()
        .find((sc) => (sc as any)[COMMON_CONFIG_SYMBOL]) as any
    )[COMMON_CONFIG_SYMBOL] as CommonConfig | undefined;
    if (!cc) {
      throw new Error(
        "No config found. Please set values before trying to access them using CommonConfig.set()"
      );
    }
    return cc.config;
  }
}

class MyConstruct extends Construct {
  constructor(scope: IConstruct, id: string) {
    super(scope, id);

    new Pet(this, "pet", {
      prefix: CommonConfig.of(this).prefix,
    });
  }
}

class MyStack extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    new RandomProvider(this, "random");
    new MyConstruct(this, "my-construct");
    new TerraformOutput(this, "git-sha", {
      value: CommonConfig.of(this).gitSha,
    });
  }
}

const app = new App();
// needs to happen before the stacks are added, else they won't find anything in their constructor
const gitSha = execSync("git rev-parse HEAD").toString();
CommonConfig.set(app, { prefix: "myorg", gitSha });
new MyStack(app, "prototype-cdktf-common-config");
app.synth();
