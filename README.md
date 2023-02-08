# prototype-cdktf-common-config

A prototype / sketch for a way to use the Constructs tree to pass down commonly shared config to constructs nested in any depth.

### Excerpt of `main.ts`

```ts
CommonConfig.set(app, { prefix: "myorg", gitSha });
// ...
new TerraformOutput(this, "git-sha", {
  value: CommonConfig.of(this).gitSha,
});
// ...
new Pet(this, "pet", {
  prefix: CommonConfig.of(this).prefix,
});
```

### Output
```bash
> cdktf plan
# ...
prototype-cdktf-common-config  Terraform used the selected providers to generate the following execution
                               plan. Resource actions are indicated with the following symbols:
                                 + create

                               Terraform will perform the following actions:
prototype-cdktf-common-config    # random_pet.my-construct_pet_B301D988 (my-construct/pet) will be created
                                 + resource "random_pet" "my-construct_pet_B301D988" {
                                     + id        = (known after apply)
                                     + length    = 2
                                     + prefix    = "myorg"
                                     + separator = "-"
                                   }

                               Plan: 1 to add, 0 to change, 0 to destroy.

                               Changes to Outputs:
                                 + git-sha = <<-EOT
                                       1a47b6951710e1b83deaf88a0570a5631b46f78d
                                   EOT

                               ─────────────────────────────────────────────────────────────────────────────

                               Saved the plan to: plan

                               To perform exactly these actions, run the following command to apply:
                                   terraform apply "plan"

```
