class GeocodingService {
	constructor() {
		this.cache = new Map();
		this.geocodingProviders = [
			{
				name: 'primary',
				baseUrl: 'https://maps.googleapis.com/maps/api',
				apiKey: process.env.GOOGLE_MAPS_API_KEY
			},
			{
				name: 'backup',
				baseUrl: 'https://api.opencagedata.com/geocode/v1',
				apiKey: process.env.OPENCAGE_API_KEY
			}
		];
	}

	async reverse({ lat, lng }) {
		const cacheKey = `${lat},${lng}`;
		if (this.cache.has(cacheKey)) {
			return this.cache.get(cacheKey);
		}

		const location = await this.fetchLocationData({ lat, lng });
		this.cache.set(cacheKey, location);
		return location;
	}

	async fetchLocationData({ lat, lng }) {
		for (const provider of this.geocodingProviders) {
			try {
				const url = this.buildGeocodingUrl(provider, { lat, lng });
				const response = await fetch(url);
				const data = await response.json();
				return this.formatLocationData(data, provider.name);
			} catch (error) {
				console.error(`Geocoding failed with ${provider.name}:`, error);
				continue;
			}
		}
		throw new Error('All geocoding providers failed');
	}

	buildGeocodingUrl(provider, { lat, lng }) {
		switch (provider.name) {
			case 'primary':
				return `${provider.baseUrl}/geocode/json?latlng=${lat},${lng}&key=${provider.apiKey}`;
			case 'backup':
				return `${provider.baseUrl}/json?q=${lat}+${lng}&key=${provider.apiKey}`;
			default:
				throw new Error('Invalid provider');
		}
	}

	formatLocationData(data, provider) {
		switch (provider) {
			case 'primary':
				return {
					formatted_address: data.results[0].formatted_address,
					place_id: data.results[0].place_id,
					components: data.results[0].address_components,
					provider
				};
			case 'backup':
				return {
					formatted_address: data.results[0].formatted,
					place_id: data.results[0].annotations.geohash,
					components: data.results[0].components,
					provider
				};
			default:
				throw new Error('Invalid provider');
		}
	}

	clearCache() {
		this.cache.clear();
	}
}

module.exports = GeocodingService;