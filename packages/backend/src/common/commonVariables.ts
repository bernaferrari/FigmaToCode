
export async function variableNameFromAliasIfAny(alias: VariableAlias | undefined): Promise<string | undefined> {
  return alias ? (await figma.variables.getVariableByIdAsync(alias.id))?.name : undefined
}
