export interface SupportedNodeForPaintStyle extends Omit<MinimalFillsMixin, "setFillStyleIdAsync"> {}

export function nodePaintStyle(node: SupportedNodeForPaintStyle): PaintStyle | undefined {
	if (node.fillStyleId && node.fillStyleId != figma.mixed) {
		// TODO: handle mixed mode, maybe ?
		const style = figma.getStyleById(node.fillStyleId)
		switch (style?.type) {
			case "PAINT": 
				return style
				break
		}
	}
}
