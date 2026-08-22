import {WorkflowStep} from './workflow-step'

interface WorkflowPathEntry<T extends object = object, S extends WorkflowStep = string, M extends object = object> {
  step: S
  data: Partial<T>
  meta: M | null
}

export type WorkflowPath<T extends object, S extends WorkflowStep, M extends object> = WorkflowPathEntry<T, S, M>[]
