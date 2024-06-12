
export function variableNameFromAliasIfAny(alias: VariableAlias | undefined) {
  return alias ? figma.variables.getVariableById(alias.id)?.name : undefined
}
