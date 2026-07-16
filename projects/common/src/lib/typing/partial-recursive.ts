declare const IGNORE_PARTIAL_BRAND: unique symbol

/**
 * Exclude a single property from {@link RecursivePartial}.
 *
 * If the property has child properties, the children will still be optional when {@link RecursivePartial} is applied.
 * In the following example `requiredParent` is marked as required. However, TypeScript will only require `requiredParent` to be `{}`
 * because `optionalChildProperty` will be marked as optional by {@link RecursivePartial}
 *
 * ```typescript
 * interface MyInterface {
 *   optionalProperty: string
 *   requiredParent: IgnorePartial<{
 *     optionalChildProperty: number
 *   }>
 * }
 * ```
 *
 * The same applies for the property's parent. If a property is typed with `IgnorePartial<T>` the parent of
 * this property will still be optional. Only when adding the parent explicitly to the recursively partialized object,
 * the parent requires this property.<br/>
 * In the following example a property typed with `RecursivePartial<MyInterface>` will compile with `const myVar: MyInterface = {}`.
 * But when explicitly setting `optionalParent` to be `{}` TypeScript will throw a compiler error.
 *
 * ```typescript
 * interface MyInterface {
 *   optionalProperty: string
 *   optionalParent: {
 *     requiredChildProperty: IgnorePartial<number>
 *   }
 * }
 *
 * // does not compile as requiredChildProperty is required
 * const myVar: MyInterface = {
 *   optionalParent: {}
 * }
 * ```
 */
export type IgnorePartial<T> = T & { readonly [IGNORE_PARTIAL_BRAND]?: never }

/**
 * Exclude a property and all of its child properties recursively from {@link RecursivePartial}.
 *
 * Unlike {@link IgnorePartial}, which only marks the property it is applied to as required,
 * `RecursiveIgnorePartial<T>` also marks all child properties of `T` as required recursively.
 *
 * In the following example `requiredParent, requiredChildProperty` and `requiredNestedProperty`
 * will all remain required when {@link RecursivePartial} is applied.
 *
 * ```typescript
 * interface MyInterface {
 *   optionalProperty: string
 *   requiredParent: RecursiveIgnorePartial<{
 *     requiredChildProperty: number,
 *     requiredNestedParent: {
 *       requiredNestedProperty: boolean
 *     }
 *   }>
 * }
 * ```
 *
 * The parent of a property typed with `RecursiveIgnorePartial<T>` is still optional when
 * {@link RecursivePartial} is apllied. However, once the parent is explicitly added to the
 * recursively partialized object, all properties within the `RecursiveIgnorePartial<T>` object
 * are required.
 *
 * ```typescript
 * interface MyInterface {
 *   optionalParent: {
 *     requiredChild: RecursiveIgnorePartial<{
 *       requiredNestedParent: {
 *         requiredNestedProperty: number
 *       }
 *     }>
 *   }
 * }
 *
 * // compiles because optionalParent is still optional
 * const myVar1: RecursivePartial<MyInterface> = {}
 *
 * // does not compile because requiredChild is required
 * const myVar: MyInterface = {
 *   optionalParent: {}
 * }
 *
 * // does not compile because all properties of requiredChild are required
 * const myVar: MyInterface = {
 *   optionalParent: {
 *     requiredChild: {}
 *   }
 * }
 * ```
 */
export type RecursiveIgnorePartial<T> = IgnorePartial<T> & {
  [P in keyof T]: RecursiveIgnorePartialComplexChildType<T[P]>
}

// All keys of T except the generated branding key IGNORE_PARTIAL_BRAND
type Keys<T> = Exclude<keyof T, typeof IGNORE_PARTIAL_BRAND>
// All keys that are marked as required
type IgnorePartialKeys<T> = {
  [P in Keys<T>]-?: typeof IGNORE_PARTIAL_BRAND extends keyof NonNullable<T[P]>
    ? P
    : never
}[Keys<T>]

// Apply RecursivePartial to all children and indexes of children with complex types
type RecursivePartialComplexChildType<T> =
  T extends (infer U)[]
    ? RecursivePartial<U>[]
    : T extends object
      ? RecursivePartial<T>
      : T

// Apply RecursiveIgnorePartial to all children and indexes of children with complex types
type RecursiveIgnorePartialComplexChildType<T> =
  T extends (infer U)[]
    ? RecursiveIgnorePartial<U>[]
    : T extends object
      ? RecursiveIgnorePartial<T>
      : IgnorePartial<T>

/**
 * Makes all properties of `T` and all of its child properties recursively optional.
 *
 * Properties marked with {@link IgnorePartial} or {@link RecursiveIgnorePartial} are excluded from being made optional.
 * Their behavior depends on which required type is applied.
 *
 */
export type RecursivePartial<T> = {
  [P in IgnorePartialKeys<T>]-?: RecursivePartialComplexChildType<T[P]>
} & {
  [P in Exclude<Keys<T>, IgnorePartialKeys<T>>]?: RecursivePartialComplexChildType<T[P]>
}
