import { describe, expect, it } from "vitest";

import { createRuntimeSandboxTemplatePlan } from "#runtime/sandbox/template-plan.js";

const definition = {
  backend: { name: "test" },
  logicalPath: "sandbox/sandbox.ts",
  sourceHash: "source-hash",
  sourceId: "sandbox",
  sourceKind: "module" as const,
};

const dockerfile = {
  contentHash: "dockerfile-hash",
  contextPath: "/app/agent/sandbox",
  path: "/app/agent/sandbox/Dockerfile",
};

describe("createRuntimeSandboxTemplatePlan", () => {
  it("prewarms a colocated Dockerfile without bootstrap or workspace files", () => {
    expect(
      createRuntimeSandboxTemplatePlan({
        definition: definition as never,
        dockerfile,
        workspaceResourceRoot: { logicalPath: "", rootEntries: [] },
      }),
    ).toEqual({ dockerfileHash: "dockerfile-hash", kind: "dockerfile" });
  });

  it("includes the Dockerfile in a bootstrap template plan", () => {
    expect(
      createRuntimeSandboxTemplatePlan({
        definition: { ...definition, bootstrap() {} } as never,
        dockerfile,
        workspaceResourceRoot: {
          contentHash: "workspace-hash",
          logicalPath: "workspace",
          rootEntries: ["README.md"],
        },
      }),
    ).toEqual({
      contentHash: "workspace-hash",
      dockerfileHash: "dockerfile-hash",
      kind: "bootstrap",
      revalidationKey: undefined,
      sourceHash: "source-hash",
    });
  });
});
