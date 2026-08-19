/** Workflow-level configuration of `workflowStoreFactory`. */
export interface WorkflowOptions<T extends object> {
  /** Data the workflow starts with, before any transition ran. */
  initialData: T
  /**
   * Whether the store tracks the position of the current step.
   *
   * When `true`, every step has to declare a `meta.position` and the `positions`, `currentPosition`,
   * `currentIndex` and `totalPositions` signals resolve; otherwise those signals are `null`.
   */
  providePositions: boolean
}
