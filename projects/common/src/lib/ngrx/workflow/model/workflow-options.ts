/** Workflow-level configuration of `workflowStoreFactory`. */
export interface WorkflowOptions<T extends object> {
  /** Data the workflow starts with, before any transition ran. */
  initialData: T
  /**
   * Whether the store tracks the position of the current step.
   *
   * When `true`, every step has to declare a `meta.position` and the store carries the `positions`,
   * `currentPosition`, `currentIndex` and `totalPositions` signals; otherwise it carries none of them.
   */
  providePositions: boolean
}

/** Options of a workflow that tracks step positions. */
export type PositionedWorkflowOptions<T extends object> = Partial<WorkflowOptions<T>> & { providePositions: true }

/** Options of a workflow that doesn't track step positions. */
export type PlainWorkflowOptions<T extends object> = Partial<WorkflowOptions<T>> & { providePositions?: false }

