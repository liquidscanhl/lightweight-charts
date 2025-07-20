import { IChartApi, ISeriesApi, SeriesMarker, Time } from 'lightweight-charts';

import { PluginBase } from '../plugin-base';

interface MarkerTooltipData {
	id: string;
	text: string;
	x: number;
	y: number;
	time: Time;
}

export class MarkerTooltipPlugin extends PluginBase {
	private _tooltipElement: HTMLDivElement | null = null;
	private _markersData: Map<string, MarkerTooltipData> = new Map();
	private _isVisible = false;

	public name(): string {
		return 'Marker Tooltip';
	}

	public attached(param: any): void {
		super.attached(param);
		this._createTooltipElement();
		this._setupEventHandlers();
	}

	public detached(): void {
		this._removeTooltipElement();
		this._markersData.clear();
		super.detached();
	}

	public addMarkerData(markers: SeriesMarker<Time>[]): void {
		// Clear existing data
		this._markersData.clear();

		// Add new marker data
		markers.forEach(marker => {
			if (marker.id && marker.tooltipText) {
				this._markersData.set(marker.id, {
					id: marker.id,
					text: marker.tooltipText,
					x: 0, // Will be updated on hover
					y: 0, // Will be updated on hover
					time: marker.time,
				});
			}
		});
	}

	private _createTooltipElement(): void {
		this._tooltipElement = document.createElement('div');
		this._tooltipElement.style.cssText = `
			position: absolute;
			background: rgba(0, 0, 0, 0.9);
			color: white;
			padding: 8px 12px;
			border-radius: 4px;
			font-size: 12px;
			font-family: Arial, sans-serif;
			pointer-events: none;
			z-index: 1000;
			display: none;
			white-space: nowrap;
			box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
		`;

		// Add to chart container
		const chartContainer = this.chart.chartElement();
		if (chartContainer) {
			chartContainer.appendChild(this._tooltipElement);
		}
	}

	private _removeTooltipElement(): void {
		if (this._tooltipElement && this._tooltipElement.parentNode) {
			this._tooltipElement.parentNode.removeChild(this._tooltipElement);
		}
		this._tooltipElement = null;
	}

	private _setupEventHandlers(): void {
		// Handle mouse move for tooltip positioning
		this.chart.subscribeCrosshairMove((param) => {
			if (!param.point || !param.hoveredObjectId || typeof param.hoveredObjectId !== 'string') {
				this._hideTooltip();
				return;
			}

			const markerData = this._markersData.get(param.hoveredObjectId);
			if (markerData) {
				this._showTooltip(markerData.text, param.point.x, param.point.y);
			} else {
				this._hideTooltip();
			}
		});

		// Handle mouse leave to hide tooltip
		const chartElement = this.chart.chartElement();
		if (chartElement) {
			chartElement.addEventListener('mouseleave', () => {
				this._hideTooltip();
			});
		}
	}

	private _showTooltip(text: string, x: number, y: number): void {
		if (!this._tooltipElement) return;

		this._tooltipElement.textContent = text;
		this._tooltipElement.style.display = 'block';

		// Position tooltip near cursor but ensure it stays within viewport
		const tooltipRect = this._tooltipElement.getBoundingClientRect();
		const chartRect = this.chart.chartElement()?.getBoundingClientRect();

		if (chartRect) {
			let tooltipX = x + 10; // Offset from cursor
			let tooltipY = y - 10;

			// Adjust if tooltip would go outside viewport
			if (tooltipX + tooltipRect.width > chartRect.right) {
				tooltipX = x - tooltipRect.width - 10;
			}
			if (tooltipY < chartRect.top) {
				tooltipY = y + 20;
			}

			this._tooltipElement.style.left = `${tooltipX}px`;
			this._tooltipElement.style.top = `${tooltipY}px`;
		}

		this._isVisible = true;
	}

	private _hideTooltip(): void {
		if (this._tooltipElement) {
			this._tooltipElement.style.display = 'none';
		}
		this._isVisible = false;
	}

	public isVisible(): boolean {
		return this._isVisible;
	}
} 