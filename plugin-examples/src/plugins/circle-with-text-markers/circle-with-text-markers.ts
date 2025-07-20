import { IChartApi, ISeriesApi, SeriesMarker, Time } from 'lightweight-charts';

import { PluginBase } from '../plugin-base';

export class CircleWithTextMarkersPlugin extends PluginBase {
	private _markersApi: any | null = null;
	private _tooltipElement: HTMLDivElement | null = null;
	private _markersData: Map<string, { text: string; time: Time }> = new Map();

	public name(): string {
		return 'Circle with Text Markers';
	}

	public attached(param: any): void {
		super.attached(param);
		this._markersApi = (window as any).LightweightCharts.createSeriesMarkers(this.series, []);
		this._createTooltipElement();
		this._setupEventHandlers();

		// Add sample markers with inner text and tooltips
		const markers: any[] = [
			{
				time: { year: 2024, month: 1, day: 15 },
				position: 'aboveBar',
				color: '#2196F3',
				shape: 'circleWithText',
				innerText: 'AB',
				innerTextColor: '#FFFFFF',
				innerTextSize: 12,
				id: 'marker1',
				tooltipText: 'Buy Signal - Strong upward momentum detected',
			},
			{
				time: { year: 2024, month: 2, day: 20 },
				position: 'belowBar',
				color: '#FF5722',
				shape: 'circleWithText',
				innerText: 'CD',
				innerTextColor: '#FFFFFF',
				innerTextSize: 14,
				id: 'marker2',
				tooltipText: 'Sell Signal - Price resistance level reached',
			},
			{
				time: { year: 2024, month: 3, day: 10 },
				position: 'inBar',
				color: '#4CAF50',
				shape: 'circleWithText',
				innerText: 'EF',
				innerTextColor: '#000000',
				innerTextSize: 10,
				id: 'marker3',
				tooltipText: 'Target Price - Key support level',
			},
		];

		// Store tooltip data
		markers.forEach(marker => {
			if (marker.id && marker.tooltipText) {
				this._markersData.set(marker.id, {
					text: marker.tooltipText,
					time: marker.time,
				});
			}
		});

		this._markersApi.setMarkers(markers);

		// Add click handler for marker interactions
		this.chart.subscribeClick((param: any) => {
			if (param.hoveredObjectId) {
				const markerData = this._markersData.get(param.hoveredObjectId);
				if (markerData) {
				}
			}
		});
	}

	public detached(): void {
		if (this._markersApi) {
			this._markersApi.setMarkers([]);
		}
		this._removeTooltipElement();
		this._markersData.clear();
		this._markersApi = null;
		super.detached();
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
			max-width: 200px;
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
		this.chart.subscribeCrosshairMove((param: any) => {
			if (!param.point || !param.hoveredObjectId) {
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

		// Also try using click events for testing
		this.chart.subscribeClick((param: any) => {
			if (param.hoveredObjectId) {
				const markerData = this._markersData.get(param.hoveredObjectId);
				if (markerData) {
					this._showTooltip(markerData.text, param.point?.x || 100, param.point?.y || 100);
				}
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
	}

	private _hideTooltip(): void {
		if (this._tooltipElement) {
			this._tooltipElement.style.display = 'none';
		}
	}
} 