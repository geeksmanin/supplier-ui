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
		
		const triggerBrowserDownload = (b: Blob, fn: string) => {
			const blobUrl = window.URL.createObjectURL(b);
			const link = document.createElement('a');
			link.href = blobUrl;
			link.setAttribute('download', fn);
			document.body.appendChild(link);
			link.click();
			link.parentNode?.removeChild(link);
			window.URL.revokeObjectURL(blobUrl);
		};

		if (isDesktopEnvironment()) {
			const reader = new FileReader();
			reader.onloadend = async () => {
				const base64data = (reader.result as string).split(',')[1];
				try {
					const res = await apiClient.post('/runtime/save-file', {
						filename: filename,
						content: base64data,
						is_base64: true
					});
					if (res.data?.cancelled) {
						return;
					}
					const path = res.data?.data?.path || res.data?.path || '';
					alert(`File saved successfully:\n${path}`);
				} catch (err: any) {
					console.warn('Native save failed, falling back to browser write:', err);
					triggerBrowserDownload(blob, filename);
				}
			};
			reader.readAsDataURL(blob);
		} else {
			triggerBrowserDownload(blob, filename);
		}
	} catch (err) {
		console.error("Downloader utility error:", err);
		throw err;
	}
};
