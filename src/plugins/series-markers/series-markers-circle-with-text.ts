import { Coordinate } from '../../model/coordinate';

import { BitmapShapeItemCoordinates, shapeSize } from './utils';

export function drawCircleWithText(
	ctx: CanvasRenderingContext2D,
	coords: BitmapShapeItemCoordinates,
	size: number,
	innerText?: string,
	innerTextColor?: string,
	innerTextSize?: number
): void {
	const circleSize = shapeSize('circleWithText', size);
	const halfSize = (circleSize - 1) / 2;

	ctx.beginPath();
	ctx.arc(coords.x, coords.y, halfSize * coords.pixelRatio, 0, 2 * Math.PI, false);
	ctx.fill();

	if (innerText && innerText.length > 0) {
		const textToShow = innerText.substring(0, 2);
		const fontSize = innerTextSize || Math.max(8, halfSize * 0.6);

		ctx.save();
		ctx.scale(coords.pixelRatio, coords.pixelRatio);
		ctx.fillStyle = innerTextColor || '#FFFFFF';
		ctx.font = `${fontSize}px Arial`;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText(textToShow, coords.x / coords.pixelRatio, coords.y / coords.pixelRatio);
		ctx.restore();
	}
}

export function hitTestCircleWithText(
	centerX: Coordinate,
	centerY: Coordinate,
	size: number,
	x: Coordinate,
	y: Coordinate
): boolean {
	const circleSize = shapeSize('circleWithText', size);
	const tolerance = 2 + circleSize / 2;

	const xOffset = centerX - x;
	const yOffset = centerY - y;

	const dist = Math.sqrt(xOffset * xOffset + yOffset * yOffset);

	return dist <= tolerance;
} 