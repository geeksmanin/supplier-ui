import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { apiClient } from '../../api/client';
import { useToast } from '../Toast/Toast';
import { SpreadsheetGrid, SpreadsheetColumn } from '../SpreadsheetGrid';
import { Button } from '../Button';
import { downloadFile } from '../../utils/downloader';

interface FieldSpec {
	name: string;
	type: string;
	required: boolean;
	description: string;
	options?: string[];
}

interface SheetSpec {
	name: string;
	description: string;
	fields: FieldSpec[];
}

interface TemplateSpec {
	entityType: string;
	description: string;
	sheets: SheetSpec[];
}

interface ImportWizardProps {
	isOpen: boolean;
	onClose: () => void;
	entityType: string; // e.g. "contacts", "organisations"
	onImportComplete?: () => void;
	/**
	 * When true, the wizard always uploads the file directly via /import/upload
	 * (async background job) without locally parsing the Excel or showing the
	 * column-mapping step (step 2). Use this for entity types whose backend
	 * handles the proprietary format natively (e.g. "maxx_purchase_orders").
	 */
	directUpload?: boolean;
}

interface ValidationError {
	sheet: string;
	row: number;
	column: string;
	value: string;
	message: string;
}

export const ImportWizard: React.FC<ImportWizardProps> = ({
	isOpen,
	onClose,
	entityType,
	onImportComplete,
	directUpload = false,
}) => {
	const { showToast } = useToast();
	const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
	const [templateSpec, setTemplateSpec] = useState<TemplateSpec | null>(null);
	const [loadingSpec, setLoadingSpec] = useState(false);
	const [file, setFile] = useState<File | null>(null);
	const [imagesZipFile, setImagesZipFile] = useState<File | null>(null);
	const [parsedSheetsData, setParsedSheetsData] = useState<Record<string, any[]>>({});
	const [sheetHeaders, setSheetHeaders] = useState<Record<string, string[]>>({});
	
	// Column mapping state: sheetName -> fieldName -> spreadsheetHeaderName
	const [mappings, setMappings] = useState<Record<string, Record<string, string>>>({});
	
	// Selected sheet for preview
	const [activePreviewSheet, setActivePreviewSheet] = useState<string>('');
	const [previewData, setPreviewData] = useState<any[]>([]);
	const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showGuidelines, setShowGuidelines] = useState(false);
	const [activeJobId, setActiveJobId] = useState<string>('');
	const [importProgress, setImportProgress] = useState<{
		processed: number;
		total: number;
		status: string;
		errors_count: number;
		error_sheet_link: string;
	} | null>(null);

	const [showHistory, setShowHistory] = useState(false);
	const [historyJobs, setHistoryJobs] = useState<any[]>([]);
	const [loadingHistory, setLoadingHistory] = useState(false);

	const fetchHistory = async () => {
		setLoadingHistory(true);
		try {
			const res = await apiClient.get('/import/history');
			if (res.data && res.data.data) {
				setHistoryJobs(res.data.data);
			}
		} catch (err) {
			console.error("Failed to fetch import history:", err);
			showToast("Failed to fetch import history", "error");
		} finally {
			setLoadingHistory(false);
		}
	};

	useEffect(() => {
		if (!isOpen) {
			setStep(1);
			setFile(null);
			setImagesZipFile(null);
			setActiveJobId('');
			setImportProgress(null);
			setParsedSheetsData({});
			setSheetHeaders({});
			setMappings({});
			setValidationErrors([]);
			setShowHistory(false);
		}
	}, [isOpen]);

	useEffect(() => {
		if (!activeJobId) return;

		const handleNotification = (e: Event) => {
			const customEvent = e as CustomEvent;
			const notification = customEvent.detail;
			if (notification && (notification.type === 'import_status' || notification.type === 'silent_sync')) {
				try {
					const metadata = typeof notification.metadata === 'string'
						? JSON.parse(notification.metadata)
						: notification.metadata;
					if (metadata && metadata.job_id === activeJobId) {
						setImportProgress(metadata);
						if (metadata.status === 'success' || metadata.status === 'partial' || metadata.status === 'failed') {
							showToast(`Background import status: ${metadata.status}`, metadata.status === 'failed' ? 'error' : 'success');
						}
					}
				} catch (err) {
					console.error("Failed to parse background import update:", err);
				}
			}
		};

		window.addEventListener('notification_received', handleNotification);
		return () => {
			window.removeEventListener('notification_received', handleNotification);
		};
	}, [activeJobId]);

	// Fetch template specifications on mount
	useEffect(() => {
		if (isOpen && entityType) {
			setLoadingSpec(true);
			apiClient.get(`/import/templates/${entityType}?format=json`)
				.then((res: any) => {
					if (res.data && res.data.data) {
						// Map keys to camelCase if needed, or handle matching snake_case
						const data = res.data.data;
						setTemplateSpec({
							entityType: data.entity_type,
							description: data.description,
							sheets: (data.sheets || []).map((s: any) => ({
								name: s.name,
								description: s.description,
								fields: (s.fields || []).map((f: any) => ({
									name: f.name,
									type: f.type,
									required: f.required,
									description: f.description,
									options: f.options,
								})),
							})),
						});
					}
				})
				.catch((_err) => {
					showToast('Failed to load import template specifications', 'error');
				})
				.finally(() => {
					setLoadingSpec(false);
				});
		}
	}, [isOpen, entityType]);

	if (!isOpen) return null;

	const handleDownloadTemplate = async () => {
		try {
			await downloadFile(`/import/templates/${entityType}`, `${entityType}_template.xlsx`);
		} catch (err) {
			console.error("Failed to download template:", err);
			showToast('Failed to download excel template', 'error');
		}
	};

	const handleLargeFileUpload = async (selectedFile: File) => {
		setIsSubmitting(true);
		try {
			const formData = new FormData();
			formData.append('entity_type', entityType);
			formData.append('file', selectedFile);

			const res = await apiClient.post('/import/upload', formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			});

			const jobId = res.data?.data?.job_id;
			setActiveJobId(jobId);
			setStep(4);
			showToast('Large file upload accepted. Starting async background import...', 'success');
		} catch (_err) {
			showToast('Failed to upload import file', 'error');
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleImagesZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = e.target.files?.[0];
		if (!selectedFile) return;
		setImagesZipFile(selectedFile);
	};

	const handleUploadBothFiles = async (sheet: File, zip: File | null) => {
		setIsSubmitting(true);
		try {
			const formData = new FormData();
			formData.append('entity_type', entityType);
			formData.append('file', sheet);
			if (zip) {
				formData.append('images_zip', zip);
			}

			const res = await apiClient.post('/import/upload', formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			});

			const jobId = res.data?.data?.job_id;
			setActiveJobId(jobId);
			setStep(4);
			showToast('Upload accepted. Starting background import...', 'success');
		} catch (_err) {
			showToast('Failed to upload files', 'error');
		} finally {
			setIsSubmitting(false);
		}
	};

	const parseSheetLocally = (selectedFile: File) => {
		const reader = new FileReader();
		reader.onload = (evt) => {
			try {
				const bstr = evt.target?.result;
				const wb = XLSX.read(bstr, { type: 'binary' });
				const sheetsData: Record<string, any[]> = {};
				const headersData: Record<string, string[]> = {};
				const initialMappings: Record<string, Record<string, string>> = {};

				wb.SheetNames.forEach((sheetName) => {
					const worksheet = wb.Sheets[sheetName];
					const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
					if (jsonData.length > 0) {
						const headers = jsonData[0].map(h => String(h).trim());
						const rows = jsonData.slice(1).map((row) => {
							const rowObj: Record<string, any> = {};
							headers.forEach((header, idx) => {
								if (header) {
									rowObj[header] = row[idx] !== undefined ? row[idx] : '';
								}
							});
							return rowObj;
						});
						sheetsData[sheetName] = rows;
						headersData[sheetName] = headers.filter(Boolean);
					}
				});

				setParsedSheetsData(sheetsData);
				setSheetHeaders(headersData);

				// Initialize mappings: try to match database fields with headers automatically
				templateSpec?.sheets.forEach((sheetSpec) => {
					initialMappings[sheetSpec.name] = {};
					const headers = headersData[sheetSpec.name] || [];
					sheetSpec.fields.forEach((field) => {
						// Auto-match exact name or normalized case-insensitive match
						const matchedHeader = headers.find(h => 
							h.toLowerCase().replace(/[\s_-]/g, '') === field.name.toLowerCase().replace(/[\s_-]/g, '')
						);
						if (matchedHeader) {
							initialMappings[sheetSpec.name][field.name] = matchedHeader;
						} else {
							initialMappings[sheetSpec.name][field.name] = '';
						}
					});
				});

				setMappings(initialMappings);
				setStep(2);
				if (templateSpec && templateSpec.sheets.length > 0) {
					setActivePreviewSheet(templateSpec.sheets[0].name);
					setPreviewData(sheetsData[templateSpec.sheets[0].name] || []);
				}
			} catch (_err) {
				showToast('Error parsing Excel file', 'error');
			}
		};
		reader.readAsBinaryString(selectedFile);
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = e.target.files?.[0];
		if (!selectedFile) return;
		setFile(selectedFile);
	};

	const handleProceed = () => {
		if (!file) return;
		// When directUpload is true, always upload via background job (no local parsing / column-mapping)
		if (directUpload || imagesZipFile || file.size > 1024 * 1024) {
			handleUploadBothFiles(file, imagesZipFile);
		} else {
			parseSheetLocally(file);
		}
	};

	const handleMapChange = (sheetName: string, fieldName: string, headerName: string) => {
		setMappings(prev => ({
			...prev,
			[sheetName]: {
				...prev[sheetName],
				[fieldName]: headerName,
			}
		}));
	};

	// Convert mapped headers to structured JSON payload matching spec
	const getMappedPayload = () => {
		const payload: Record<string, any[]> = {};
		templateSpec?.sheets.forEach((sheetSpec) => {
			const sheetRows = parsedSheetsData[sheetSpec.name] || [];
			const fieldMappings = mappings[sheetSpec.name] || {};
			
			payload[sheetSpec.name] = sheetRows.map((row) => {
				const rowObj: Record<string, any> = {};
				sheetSpec.fields.forEach((field) => {
					const mappedHeaderName = fieldMappings[field.name];
					rowObj[field.name] = mappedHeaderName ? row[mappedHeaderName] : '';
				});
				return rowObj;
			});
		});
		return payload;
	};

	const handleValidate = async () => {
		setIsSubmitting(true);
		try {
			const payload = getMappedPayload();
			const res = await apiClient.post('/import/validate', {
				entity_type: entityType,
				payload: payload,
			});
			const errs = (res.data?.data || []) as ValidationError[];
			setValidationErrors(errs);

			// Set active sheet for editing and preview data
			if (templateSpec && templateSpec.sheets.length > 0) {
				const firstSheetName = templateSpec.sheets[0].name;
				setActivePreviewSheet(firstSheetName);
				setPreviewData(payload[firstSheetName] || []);
			}

			setStep(3);
			if (errs.length > 0) {
				showToast(`Found ${errs.length} validation errors. Please review and correct them.`, 'warning');
			} else {
				showToast('Validation passed with 0 errors.', 'success');
			}
		} catch (_err) {
			showToast('Validation request failed', 'error');
		} finally {
			setIsSubmitting(false);
		}
	};

	const handlePreviewDataChange = (newData: any[]) => {
		setPreviewData(newData);
		// Update parent parsedSheetsData reflecting mapped payload
		// For simplicity, we directly sync the active preview sheet's edited fields
		const fieldMappings = mappings[activePreviewSheet] || {};
		const sheetRows = [...(parsedSheetsData[activePreviewSheet] || [])];
		
		newData.forEach((row, idx) => {
			if (sheetRows[idx]) {
				templateSpec?.sheets.find(s => s.name === activePreviewSheet)?.fields.forEach(field => {
					const header = fieldMappings[field.name];
					if (header) {
						sheetRows[idx] = { ...sheetRows[idx], [header]: row[field.name] };
					}
				});
			}
		});

		setParsedSheetsData(prev => ({
			...prev,
			[activePreviewSheet]: sheetRows,
		}));
	};

	const handleCommitImport = async () => {
		setIsSubmitting(true);
		try {
			const payload = getMappedPayload();
			await apiClient.post('/import/commit', {
				entity_type: entityType,
				payload: payload,
			});
			showToast('Import completed successfully', 'success');
			if (onImportComplete) onImportComplete();
			onClose();
		} catch (_err) {
			showToast('Failed to commit import records', 'error');
		} finally {
			setIsSubmitting(false);
		}
	};

	// Construct dynamic columns for the SpreadsheetGrid based on spec
	const getGridColumns = (): SpreadsheetColumn[] => {
		const sheetSpec = templateSpec?.sheets.find(s => s.name === activePreviewSheet);
		if (!sheetSpec) return [];

		return sheetSpec.fields.map((field) => {
			return {
				key: field.name,
				label: field.name + (field.required ? ' *' : ''),
				type: field.options ? 'select' : 'text',
				options: field.options?.map(opt => ({ value: opt, label: opt })),
				width: '180px',
				render: (val, _row, rIdx) => {
					const cellError = validationErrors.find(e => 
						e.sheet === activePreviewSheet && e.column === field.name && e.row === (rIdx + 1)
					);

					return (
						<div style={{
							display: 'flex',
							alignItems: 'center',
							height: '100%',
							border: cellError ? '1px solid #ef4444' : 'none',
							backgroundColor: cellError ? '#fee2e2' : 'transparent',
							padding: '2px 4px',
							borderRadius: '4px'
						}} title={cellError?.message}>
							<span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{String(val || '')}</span>
						</div>
					);
				}
			};
		});
	};

	return (
		<div style={{
			position: 'fixed',
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
			backgroundColor: 'rgba(15, 23, 42, 0.65)',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			zIndex: 9999,
			backdropFilter: 'blur(4px)',
		}}>
			<div style={{
				backgroundColor: '#ffffff',
				width: '90%',
				maxWidth: step === 3 ? '1200px' : '640px',
				maxHeight: '90vh',
				borderRadius: '12px',
				boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
				display: 'flex',
				flexDirection: 'column',
				overflow: 'hidden',
				border: '1px solid #e2e8f0',
				fontFamily: 'system-ui, -apple-system, sans-serif',
				position: 'relative'
			}}>
				{isSubmitting && (
					<div style={{
						position: 'absolute',
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						backgroundColor: 'rgba(255, 255, 255, 0.7)',
						backdropFilter: 'blur(2px)',
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						justifyContent: 'center',
						zIndex: 1000,
						gap: '12px'
					}}>
						<div style={{
							border: '4px solid #f3f3f3',
							borderTop: '4px solid #2563eb',
							borderRadius: '50%',
							width: '40px',
							height: '40px',
							animation: 'spin 1s linear infinite',
						}} />
						<span style={{ fontSize: '0.9rem', color: '#1e293b', fontWeight: 600 }}>
							Validating and processing spreadsheet data...
						</span>
					</div>
				)}
				{/* Header */}
				<div style={{
					padding: '16px 24px',
					borderBottom: '1px solid #e2e8f0',
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					backgroundColor: '#f8fafc'
				}}>
					<div>
						<h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>
							Import {entityType.charAt(0).toUpperCase() + entityType.slice(1)}
						</h3>
						<span style={{ fontSize: '0.8rem', color: '#64748b' }}>
							{showHistory ? 'Import history log and reports' : `Step ${step} of 3: ${
								step === 1 ? 'Upload File' : step === 2 ? 'Map Columns' : 'Preview & Validate'
							}`}
						</span>
					</div>
					<div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
						{step === 1 && (
							<Button 
								variant="secondary" 
								onClick={() => {
									if (showHistory) {
										setShowHistory(false);
									} else {
										setShowHistory(true);
										fetchHistory();
									}
								}}
							>
								{showHistory ? 'Back to Import' : 'View History'}
							</Button>
						)}
						<button 
							onClick={onClose} 
							style={{
								background: 'none',
								border: 'none',
								fontSize: '1.5rem',
								cursor: 'pointer',
								color: '#94a3b8',
								hover: { color: '#64748b' }
							} as any}
						>
							&times;
						</button>
					</div>
				</div>

				{/* Body Content */}
				<div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
					{loadingSpec && (
						<div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', justifyContent: 'center', padding: '60px 0' }}>
							<div style={{
								border: '4px solid #f3f3f3',
								borderTop: '4px solid #2563eb',
								borderRadius: '50%',
								width: '40px',
								height: '40px',
								animation: 'spin 1s linear infinite',
							}} />
							<span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 500 }}>
								Loading template configuration...
							</span>
						</div>
					)}

					{step === 1 && !loadingSpec && (
						showHistory ? (
							<div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
								<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
									<h4 style={{ margin: 0, color: '#1e293b', fontSize: '1.05rem', fontWeight: 600 }}>Past Import Logs</h4>
									<Button variant="secondary" onClick={() => setShowHistory(false)}>Back to Import</Button>
								</div>
								
								{loadingHistory ? (
									<div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading history...</div>
								) : historyJobs.length === 0 ? (
									<div style={{ padding: '40px', textAlign: 'center', color: '#64748b', border: '1px dashed #cbd5e1', borderRadius: '8px' }}>
										No import history found.
									</div>
								) : (
									<div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
										<table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
											<thead>
												<tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
													<th style={{ padding: '10px 12px', fontWeight: 600, color: '#475569' }}>Date</th>
													<th style={{ padding: '10px 12px', fontWeight: 600, color: '#475569' }}>Filename</th>
													<th style={{ padding: '10px 12px', fontWeight: 600, color: '#475569' }}>Status</th>
													<th style={{ padding: '10px 12px', fontWeight: 600, color: '#475569' }}>Progress</th>
													<th style={{ padding: '10px 12px', fontWeight: 600, color: '#475569' }}>Actions</th>
												</tr>
											</thead>
											<tbody>
												{historyJobs.map((job) => (
													<tr key={job.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
														<td style={{ padding: '10px 12px', color: '#334155' }}>
															{new Date(job.created_at).toLocaleString()}
														</td>
														<td style={{ padding: '10px 12px', color: '#334155', fontWeight: 500 }}>
															{job.filename}
														</td>
														<td style={{ padding: '10px 12px' }}>
															<span style={{
																padding: '2px 8px',
																borderRadius: '4px',
																fontSize: '0.75rem',
																fontWeight: 600,
																textTransform: 'uppercase',
																backgroundColor: job.status === 'success' ? '#dcfce7' : job.status === 'partial' ? '#fef3c7' : '#fee2e2',
																color: job.status === 'success' ? '#15803d' : job.status === 'partial' ? '#b45309' : '#b91c1c'
															}}>
																{job.status}
															</span>
														</td>
														<td style={{ padding: '10px 12px', color: '#475569', fontWeight: 600 }}>
															{job.processed_rows} / {job.total_rows} rows
														</td>
														<td style={{ padding: '10px 12px' }}>
															{job.error_sheet_key && (
																<button
																	onClick={async () => {
																		try {
																			await downloadFile(`/import/download-error-sheet?key=${encodeURIComponent(job.error_sheet_key)}`, 'import_errors.xlsx');
																		} catch (err) {
																			showToast('Failed to download error report', 'error');
																		}
																	}}
																	style={{ color: '#2563eb', textDecoration: 'underline', fontWeight: 500, background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
																>
																	Error Report
																</button>
															)}
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								)}
							</div>
						) : (
							<div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
								{/* Guidelines */}
								<div style={{
									border: '1px solid #e2e8f0',
									borderRadius: '8px',
									overflow: 'hidden'
								}}>
									<button
										onClick={() => setShowGuidelines(!showGuidelines)}
										style={{
											width: '100%',
											padding: '12px 16px',
											backgroundColor: '#f1f5f9',
											border: 'none',
											textAlign: 'left',
											fontWeight: 600,
											display: 'flex',
											justifyContent: 'space-between',
											cursor: 'pointer'
										}}
									>
										<span>Import Guidelines & Rules</span>
										<span>{showGuidelines ? '▲' : '▼'}</span>
									</button>
									{showGuidelines && (
										<div style={{ padding: '16px', fontSize: '0.85rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '8px' }}>
											<p style={{ margin: 0 }}><strong>Missing Columns</strong>: Columns not present in the spreadsheet are ignored and will not modify existing database entries.</p>
											<p style={{ margin: 0 }}><strong>Empty Cells</strong>: Columns that exist in the spreadsheet but contain blank values will explicitly reset/nullify the database entry.</p>
											<p style={{ margin: 0 }}><strong>Multi-Sheet linking</strong>: Relational worksheets (e.g. Contacts & Addresses) must link together using a key (like Temporary ID) for mapping.</p>
										</div>
									)}
								</div>

								{/* Template Download Card */}
								<div style={{
									border: '1px solid #3b82f6',
									borderRadius: '8px',
									padding: '16px',
									backgroundColor: '#eff6ff',
									display: 'flex',
									justifyContent: 'space-between',
									alignItems: 'center'
								}}>
									<div>
										<h4 style={{ margin: 0, color: '#1e3a8a', fontSize: '0.95rem' }}>Need the import layout?</h4>
										<p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#2563eb' }}>Download a dynamically generated template structured according to the latest database schema.</p>
									</div>
									<Button onClick={handleDownloadTemplate} variant="primary">
										Download Excel Template
									</Button>
								</div>

								{/* Upload File Boxes */}
								<div style={{ display: 'flex', gap: '20px', width: '100%' }}>
									{/* Main Spreadsheet upload */}
									<div style={{ flex: 1 }}>
										<div 
											onClick={() => document.getElementById('sheet-file-input')?.click()}
											style={{
												border: '2px dashed #3b82f6',
												borderRadius: '12px',
												padding: '30px 20px',
												textAlign: 'center',
												cursor: 'pointer',
												backgroundColor: '#f8fafc',
												hover: { backgroundColor: '#f1f5f9' }
											} as any}
										>
											<input 
												id="sheet-file-input" 
												type="file" 
												accept=".xlsx,.xls" 
												style={{ display: 'none' }} 
												onChange={handleFileChange} 
											/>
											<span style={{ fontSize: '2rem', display: 'block', marginBottom: '8px' }}>📊</span>
											<span style={{ fontWeight: 600, color: '#3b82f6', display: 'block', marginBottom: '4px' }}>Upload Spreadsheet (Excel)</span>
											{file ? (
												<span style={{ fontSize: '0.8rem', color: '#1e293b', fontWeight: 600 }}>{file.name}</span>
											) : (
												<span style={{ display: 'block', fontSize: '0.75rem', marginTop: '4px' }}>Supports .xlsx and .xls formats</span>
											)}
										</div>
									</div>

									{/* ZIP Images upload */}
									<div style={{ flex: 1 }}>
										<div 
											onClick={() => document.getElementById('zip-file-input')?.click()}
											style={{
												border: '2px dashed #cbd5e1',
												borderRadius: '12px',
												padding: '30px 20px',
												textAlign: 'center',
												cursor: 'pointer',
												backgroundColor: '#f8fafc',
												hover: { backgroundColor: '#f1f5f9' }
											} as any}
										>
											<input 
												id="zip-file-input" 
												type="file" 
												accept=".zip" 
												style={{ display: 'none' }} 
												onChange={handleImagesZipChange} 
											/>
											<span style={{ fontSize: '2rem', display: 'block', marginBottom: '8px' }}>🖼️</span>
											<span style={{ fontWeight: 600, color: '#3b82f6', display: 'block', marginBottom: '4px' }}>Upload Images (ZIP)</span>
											{imagesZipFile ? (
												<span style={{ fontSize: '0.8rem', color: '#1e293b', fontWeight: 600 }}>{imagesZipFile.name}</span>
											) : (
												<span style={{ display: 'block', fontSize: '0.75rem', marginTop: '4px' }}>Optional ZIP containing product images</span>
											)}
										</div>
									</div>
								</div>

								{file && (
									<div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
										<Button 
											onClick={handleProceed} 
											variant="primary"
											style={{ 
												backgroundColor: '#2563eb', 
												color: '#ffffff',
												padding: '10px 24px',
												fontWeight: 600,
												borderRadius: '6px'
											}}
										>
											Proceed with Import →
										</Button>
									</div>
								)}
							</div>
						)
					)}

					{step === 2 && templateSpec && (
						<div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
							<p style={{ margin: 0, fontSize: '0.9rem', color: '#475569' }}>
								Map the columns of your uploaded Excel sheets to the corresponding database input fields.
							</p>

							{templateSpec.sheets.map((sheetSpec) => (
								<div key={sheetSpec.name} style={{
									border: '1px solid #cbd5e1',
									borderRadius: '8px',
									padding: '16px',
									backgroundColor: '#ffffff'
								}}>
									<h4 style={{ margin: '0 0 12px 0', fontSize: '1rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
										<span>📄</span> {sheetSpec.name} Sheet
									</h4>
									<div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
										{sheetSpec.fields.map((field) => {
											const selectedHeader = mappings[sheetSpec.name]?.[field.name] || '';
											const headers = sheetHeaders[sheetSpec.name] || [];

											return (
												<div key={field.name} style={{
													display: 'flex',
													alignItems: 'center',
													justifyContent: 'space-between',
													padding: '8px 12px',
													borderRadius: '6px',
													backgroundColor: '#f8fafc',
													border: '1px solid #e2e8f0'
												}}>
													<div style={{ flex: 1, paddingRight: '16px' }}>
														<span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#334155' }}>
															{field.name} {field.required && <span style={{ color: '#ef4444' }}>*</span>}
														</span>
														<span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>
															{field.description}
														</span>
													</div>
													<select
														value={selectedHeader}
														onChange={(e) => handleMapChange(sheetSpec.name, field.name, e.target.value)}
														style={{
															padding: '6px 12px',
															borderRadius: '6px',
															border: '1px solid #cbd5e1',
															fontSize: '0.85rem',
															minWidth: '180px',
															outline: 'none',
															backgroundColor: '#ffffff'
														}}
													>
														<option value="">-- Ignore Field --</option>
														{headers.map(header => (
															<option key={header} value={header}>{header}</option>
														))}
													</select>
												</div>
											);
										})}
									</div>
								</div>
							))}

							<div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
								<Button onClick={() => setStep(1)} variant="secondary">Back</Button>
								<Button onClick={handleValidate} isLoading={isSubmitting}>Run Validation Dry-Run</Button>
							</div>
						</div>
					)}

					{step === 3 && templateSpec && (
						<div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
							<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
								<div>
									<h4 style={{ margin: 0, color: '#0f172a', fontSize: '1rem' }}>Review Parsed Data</h4>
									<p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
										Cells highlighted in red contain errors. Double click any cell to edit and resolve issues inline.
									</p>
								</div>
								
								{/* Sheet Tabs */}
								{templateSpec.sheets.length > 1 && (
									<div style={{ display: 'flex', gap: '4px', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
										{templateSpec.sheets.map(s => (
											<button
												key={s.name}
												onClick={() => {
													const payload = getMappedPayload();
													setActivePreviewSheet(s.name);
													setPreviewData(payload[s.name] || []);
												}}
												style={{
													padding: '6px 12px',
													border: 'none',
													borderRadius: '6px',
													fontSize: '0.85rem',
													cursor: 'pointer',
													fontWeight: activePreviewSheet === s.name ? 600 : 500,
													backgroundColor: activePreviewSheet === s.name ? '#ffffff' : 'transparent',
													boxShadow: activePreviewSheet === s.name ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
													color: activePreviewSheet === s.name ? '#1e293b' : '#64748b'
												}}
											>
												{s.name}
											</button>
										))}
									</div>
								)}
							</div>

							{/* Spreadsheet Grid */}
							<SpreadsheetGrid
								columns={getGridColumns()}
								data={previewData}
								onChange={handlePreviewDataChange}
							/>

							{/* Error log summary panel */}
							{validationErrors.length > 0 && (
								<div style={{
									border: '1px solid #fee2e2',
									borderRadius: '8px',
									backgroundColor: '#fef2f2',
									padding: '16px'
								}}>
									<h5 style={{ margin: '0 0 8px 0', color: '#991b1b', fontSize: '0.9rem', fontWeight: 700 }}>
										Validation Error Details ({validationErrors.length})
									</h5>
									<div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '120px', overflowY: 'auto' }}>
										{validationErrors.map((err, idx) => (
											<span key={idx} style={{ fontSize: '0.78rem', color: '#b91c1c' }}>
												• Sheet <strong>{err.sheet}</strong>, Row <strong>{err.row}</strong>, Column <strong>{err.column}</strong>: {err.message} (Got: "{err.value}")
											</span>
										))}
									</div>
								</div>
							)}

							<div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
								<Button onClick={() => setStep(2)} variant="secondary">Back</Button>
								<Button onClick={handleValidate} isLoading={isSubmitting} variant="secondary">Re-validate</Button>
								<Button 
									onClick={handleCommitImport} 
									isLoading={isSubmitting} 
									disabled={validationErrors.length > 0}
								>
									Commit Import
								</Button>
							</div>
						</div>
					)}

					{step === 4 && (
						<div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', padding: '40px 20px' }}>
							<div style={{ position: 'relative', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
								{importProgress?.status === 'success' ? (
									<svg style={{ width: '64px', height: '64px', color: '#16a34a' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
										<path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
								) : importProgress?.status === 'partial' ? (
									<svg style={{ width: '64px', height: '64px', color: '#ea580c' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
										<path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
									</svg>
								) : importProgress?.status === 'failed' ? (
									<svg style={{ width: '64px', height: '64px', color: '#dc2626' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
										<path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
								) : (
									<div className="spinner" style={{
										border: '4px solid #f3f3f3',
										borderTop: '4px solid #2563eb',
										borderRadius: '50%',
										width: '60px',
										height: '60px',
										animation: 'spin 1s linear infinite',
									}} />
								)}
							</div>
							<div style={{ textAlign: 'center' }}>
								<h4 style={{ margin: '12px 0 4px 0', color: '#0f172a', fontSize: '1.1rem', fontWeight: 600 }}>
									{importProgress?.status === 'success'
										? 'Import Completed Successfully!'
										: importProgress?.status === 'partial'
										? 'Import Completed with Errors'
										: importProgress?.status === 'failed'
										? 'Import Failed'
										: importProgress?.status === 'processing'
										? 'Processing Import...'
										: 'Import Task Pending'}
								</h4>
								<p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
									Job ID: <code style={{ backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>{activeJobId}</code>
								</p>
							</div>

							{importProgress && (
								<div style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
									<div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#475569' }}>
										<span>Progress:</span>
										<strong>{importProgress.processed} / {importProgress.total} rows</strong>
									</div>
									<div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
										<div style={{
											width: `${importProgress.total > 0 ? (importProgress.processed / importProgress.total) * 100 : 0}%`,
											height: '100%',
											backgroundColor: '#2563eb',
											transition: 'width 0.3s ease'
										}} />
									</div>
									{importProgress.errors_count > 0 && (
										<div style={{
											border: '1px solid #fee2e2',
											borderRadius: '8px',
											backgroundColor: '#fef2f2',
											padding: '12px',
											marginTop: '12px',
											display: 'flex',
											flexDirection: 'column',
											gap: '8px'
										}}>
											<span style={{ fontSize: '0.85rem', color: '#991b1b', fontWeight: 600 }}>
												Import completed with errors ({importProgress.errors_count} validation failures)
											</span>
											{importProgress.error_sheet_link && (
												<button 
													onClick={async () => {
														try {
															await downloadFile(`/import/download-error-sheet?key=${encodeURIComponent(importProgress.error_sheet_link)}`, 'import_errors.xlsx');
														} catch (err) {
															showToast('Failed to download error report', 'error');
														}
													}}
													style={{ fontSize: '0.8rem', color: '#2563eb', textDecoration: 'underline', fontWeight: 500, background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}
												>
													Download Error Report Sheet
												</button>
											)}
										</div>
									)}
								</div>
							)}

							<div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
								<Button 
									onClick={() => {
										onClose();
										if (onImportComplete) onImportComplete();
									}} 
									disabled={importProgress?.status === 'processing'}
								>
									Close
								</Button>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};
