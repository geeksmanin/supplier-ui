import { useState, useMemo, useEffect, useCallback } from 'react';
import { DynamicDataModel } from '../model/DynamicDataModel';
import { AvailableKey } from '../model/types';
import { TemplateDefinition } from '../engine/types';
import { paginateCollection, PagePaginationConfig, PaginatedPage } from '../engine/pagination';
import { generateQrCodeDataUrl, QROptions } from '../engine/qrEngine';

export interface UseTemplateEngineOptions {
  dataModel: DynamicDataModel;
  templates: TemplateDefinition[];
  defaultTemplateId?: string;
  paginationConfig?: PagePaginationConfig;
  irnQrData?: string;                 // Signed IRN string from E-invoice
  upiQrData?: string;                 // UPI Payment URI
  qrOptions?: QROptions;
}

export interface UseTemplateEngineReturn {
  series: string;
  availableTemplates: TemplateDefinition[];
  selectedTemplate: TemplateDefinition | null;
  setSelectedTemplateId: (id: string) => void;
  paginatedPages: PaginatedPage<any>[];
  qrCodes: {
    irnQrUrl: string;
    upiQrUrl: string;
    isLoading: boolean;
  };
  availableKeys: AvailableKey[];
  flattenedKeys: AvailableKey[];
  dataModel: DynamicDataModel;
  handlePrint: () => void;
}

export function useTemplateEngine({
  dataModel,
  templates,
  defaultTemplateId,
  paginationConfig,
  irnQrData,
  upiQrData,
  qrOptions,
}: UseTemplateEngineOptions): UseTemplateEngineReturn {
  // 1. Detect Document Series (e.g. "B" from "B/165")
  const series = useMemo(() => dataModel.getSeries(), [dataModel]);

  // 2. Filter Active Templates matching this Series
  const availableTemplates = useMemo(() => {
    const cleanSeries = series.toUpperCase().trim();
    return (templates || []).filter((tpl) => {
      if (!tpl.isActive) return false;
      return tpl.series.some((s) => s === '*' || s.toUpperCase().trim() === cleanSeries);
    });
  }, [templates, series]);

  // 3. Current Selected Template
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(() => {
    if (defaultTemplateId && availableTemplates.some((t) => t.id === defaultTemplateId)) {
      return defaultTemplateId;
    }
    return availableTemplates[0]?.id || '';
  });

  // Keep selected template valid when series or templates change
  useEffect(() => {
    if (availableTemplates.length > 0 && !availableTemplates.some((t) => t.id === selectedTemplateId)) {
      setSelectedTemplateId(availableTemplates[0].id);
    }
  }, [availableTemplates, selectedTemplateId]);

  const selectedTemplate = useMemo(() => {
    return availableTemplates.find((t) => t.id === selectedTemplateId) || availableTemplates[0] || null;
  }, [availableTemplates, selectedTemplateId]);

  // 4. Resolve QR Codes (IRN and UPI) asynchronously
  const [irnQrUrl, setIrnQrUrl] = useState<string>('');
  const [upiQrUrl, setUpiQrUrl] = useState<string>('');
  const [isQrLoading, setIsQrLoading] = useState<boolean>(Boolean(irnQrData || upiQrData));

  useEffect(() => {
    let isMounted = true;
    setIsQrLoading(Boolean(irnQrData || upiQrData));

    Promise.all([
      irnQrData ? generateQrCodeDataUrl(irnQrData, qrOptions) : Promise.resolve(''),
      upiQrData ? generateQrCodeDataUrl(upiQrData, { width: 140 }) : Promise.resolve(''),
    ]).then(([irnRes, upiRes]) => {
      if (isMounted) {
        setIrnQrUrl(irnRes);
        setUpiQrUrl(upiRes);
        setIsQrLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [irnQrData, upiQrData, qrOptions]);

  // 5. Intelligent Multi-page Pagination for Table Items
  const paginatedPages = useMemo(() => {
    const rawItems = dataModel.getCollection('items') || [];
    const config = selectedTemplate?.paginationConfig || paginationConfig;
    return paginateCollection(rawItems, config);
  }, [dataModel, selectedTemplate, paginationConfig]);

  // 6. Available Data Keys Introspection
  const availableKeys = useMemo(() => dataModel.listAvailableKeys(), [dataModel]);
  const flattenedKeys = useMemo(() => dataModel.listFlattenedKeys(), [dataModel]);

  // 7. System Print Trigger
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  return {
    series,
    availableTemplates,
    selectedTemplate,
    setSelectedTemplateId,
    paginatedPages,
    qrCodes: {
      irnQrUrl,
      upiQrUrl,
      isLoading: isQrLoading,
    },
    availableKeys,
    flattenedKeys,
    dataModel,
    handlePrint,
  };
}
