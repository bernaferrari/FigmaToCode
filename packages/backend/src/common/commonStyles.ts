export interface SupportedNodeForPaintStyle extends Omit<MinimalFillsMixin, "setFillStyleIdAsync"> {}

export async function nodePaintStyle(node: SupportedNodeForPaintStyle): Promise<PaintStyle | undefined> {
	if (node.fillStyleId && node.fillStyleId != figma.mixed) {
		// TODO: handle mixed mode, maybe ?
		const style = await figma.getStyleByIdAsync(node.fillStyleId)
		switch (style?.type) {
			case "PAINT": 
				return style
				break
		}
	}
}
