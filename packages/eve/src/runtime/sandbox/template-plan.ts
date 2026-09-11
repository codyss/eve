import type { CompiledWorkspaceResourceRoot } from "#compiler/manifest.js";
import type { SandboxDockerfile } from "#execution/sandbox/dockerfile.js";
import type { ResolvedSandboxDefinition } from "#runtime/types.js";

/**
 * Describes whether one sandbox needs a prewarmed template and, if so,
 * which inputs must participate in the template key.
 */
export type RuntimeSandboxTemplatePlan =
  | {
      readonly kind: "none";
    }
  | {
      readonly contentHash?: string;
      readonly kind: "workspace-content";
    }
  | {
      readonly contentHash?: string;
      readonly dockerfileHash?: string;
      readonly kind: "bootstrap";
      readonly revalidationKey?: string;
      readonly sourceHash: string;
    }
  | {
      readonly contentHash?: string;
      readonly dockerfileHash: string;
      readonly kind: "dockerfile";
    };

/**
 * Chooses the template strategy for one resolved sandbox definition.
 */
export function createRuntimeSandboxTemplatePlan(input: {
  readonly definition: ResolvedSandboxDefinition;
  readonly dockerfile?: SandboxDockerfile;
  readonly workspaceResourceRoot: CompiledWorkspaceResourceRoot;
}): RuntimeSandboxTemplatePlan {
  if (input.definition.bootstrap !== undefined) {
    if (input.definition.sourceHash === undefined) {
      throw new Error(
        `Sandbox "${input.definition.logicalPath}" defines bootstrap() but has no compiled sourceHash.`,
      );
    }

    return {
      contentHash: input.workspaceResourceRoot.contentHash,
      dockerfileHash: input.dockerfile?.contentHash,
      kind: "bootstrap",
      revalidationKey: input.definition.revalidationKey,
      sourceHash: input.definition.sourceHash,
    };
  }

  if (input.dockerfile !== undefined) {
    return {
      contentHash: input.workspaceResourceRoot.contentHash,
      dockerfileHash: input.dockerfile.contentHash,
      kind: "dockerfile",
    };
  }

  if (
    input.workspaceResourceRoot.contentHash === undefined &&
    input.workspaceResourceRoot.rootEntries.length === 0
  ) {
    return { kind: "none" };
  }

  return {
    contentHash: input.workspaceResourceRoot.contentHash,
    kind: "workspace-content",
  };
}
