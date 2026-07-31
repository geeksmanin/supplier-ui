import { apiClient } from '../api/client';

export const isDesktopEnvironment = (): boolean => {
	return !!(window as any).wails ||
				 window.location.hostname === 'wails' ||
				 window.location.protocol === 'wails:' ||
				 window.location.hostname.includes('wails');
};

/**
 * Downloads a file by path from the API, handling blob conversion for both web and desktop environments.
 */
export const downloadFile = async (url: string, filename: string): Promise<void> => {
	try {
		// Fetching as a Blob and programmatically triggering link download
		const response = await apiClient.get(url, {
			responseType: 'blob'
		});
		
		const contentType = response.headers ? response.headers['content-type'] : undefined;
		const mimeType = typeof contentType === 'string' ? contentType : 'application/octet-stream';
		const blob = new Blob([response.data], { 
			type: mimeType
		});
		
		const wails = (window as any).go;
		if (isDesktopEnvironment() && wails && wails.main && wails.main.App && wails.main.App.SaveFileFromBlob) {
			// If a native file saving method exists on Go-side, use it
			const reader = new FileReader();
			reader.onloadend = async () => {
				const base64data = (reader.result as string).split(',')[1];
				await wails.main.App.SaveFileFromBlob(filename, base64data);
			};
			reader.readAsDataURL(blob);
		} else {
			// Standard browser blob download
			const blobUrl = window.URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = blobUrl;
			link.setAttribute('download', filename);
			document.body.appendChild(link);
			link.click();
			link.parentNode?.removeChild(link);
			window.URL.revokeObjectURL(blobUrl);
		}
	} catch (err) {
		console.error("Downloader utility error:", err);
		throw err;
	}
};
