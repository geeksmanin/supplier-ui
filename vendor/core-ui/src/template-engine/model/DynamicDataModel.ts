import {
  AvailableKey,
  CollectionItemField,
  CollectionOptions,
  KeyDataType,
  KeyRegistrationMeta,
} from './types';

export class DynamicDataModel {
  private raw: any;
  private customGetters: Map<string, (raw: any) => any> = new Map();
  private keyMeta: Map<string, KeyRegistrationMeta> = new Map();
  private collections: Map<string, (raw: any) => any[]> = new Map();
  private collectionOptionsMap: Map<string, CollectionOptions> = new Map();
  private seriesExtractor?: (raw: any) => string;

  constructor(rawPayload: any) {
    this.raw = rawPayload || {};
  }

  /**
   * Returns the underlying raw payload
   */
  getRaw(): any {
    return this.raw;
  }

  /**
   * Registers a single scalar or object value getter with optional type metadata
   */
  registerKey(
    key: string,
    getter: (raw: any) => any,
    meta?: KeyRegistrationMeta
  ): this {
    this.customGetters.set(key, getter);
    if (meta) {
      this.keyMeta.set(key, meta);
    }
    return this;
  }

  /**
   * Registers a collection/array (such as items, batches, expenses)
   * Automatically exposes array item keys (e.g. item.Name, item.SalePrice, item.Discount, item.HSN)
   */
  registerCollection(
    collectionName: string,
    extractor: (raw: any) => any[],
    options?: CollectionOptions
  ): this {
    this.collections.set(collectionName, extractor);
    if (options) {
      this.collectionOptionsMap.set(collectionName, options);
    }
    return this;
  }

  /**
   * Checks if a collection is explicitly registered on the model
   */
  hasCollection(collectionName: string): boolean {
    return this.collections.has(collectionName);
  }


  /**
   * Sets custom series extraction function
   */
  setSeriesExtractor(extractor: (raw: any) => string): this {
    this.seriesExtractor = extractor;
    return this;
  }

  /**
   * Extracts the Series from the document (e.g. "B" from "B/165", "SO-5" from "SO-5-102")
   */
  getSeries(): string {
    if (this.seriesExtractor) {
      try {
        const extracted = this.seriesExtractor(this.raw);
        if (extracted) return extracted.trim();
      } catch (err) {
        console.warn('[DynamicDataModel] Custom series extractor error:', err);
      }
    }

    // Default fallback: match prefix from doc number or DocNo
    const docNo =
      this.getValue('doc.no') ||
      this.getValue('DocNo') ||
      this.getValue('doc_no') ||
      '';

    if (docNo) {
      const match = String(docNo).match(/^([A-Za-z0-9_-]+)[/-]/);
      if (match) return match[1].trim();
    }

    return 'DEFAULT';
  }

  /**
   * Resolves a value by key or dot-notation path
   */
  getValue(path: string): any {
    if (!path) return undefined;

    // 1. Direct custom getter match
    if (this.customGetters.has(path)) {
      return this.customGetters.get(path)!(this.raw);
    }

    // 2. Case-insensitive lookup among registered keys
    const lowerPath = path.toLowerCase();
    let foundGetter: ((raw: any) => any) | undefined;
    this.customGetters.forEach((getter, key) => {
      if (!foundGetter && key.toLowerCase() === lowerPath) {
        foundGetter = getter;
      }
    });
    if (foundGetter) {
      return (foundGetter as (raw: any) => any)(this.raw);
    }

    // 3. Dot-notation object traversal on raw payload
    try {
      const parts = path.split('.');
      let current = this.raw;
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (current === undefined || current === null) return undefined;
        current = current[part];
      }
      return current;
    } catch {
      return undefined;
    }
  }

  /**
   * Returns a resolved collection array
   */
  getCollection(name: string): any[] {
    if (!name) return [];

    if (this.collections.has(name)) {
      return this.collections.get(name)!(this.raw) || [];
    }

    // Case-insensitive collection lookup
    const lowerName = name.toLowerCase();
    let foundExtractor: ((raw: any) => any[]) | undefined;
    this.collections.forEach((extractor, key) => {
      if (!foundExtractor && key.toLowerCase() === lowerName) {
        foundExtractor = extractor;
      }
    });
    if (foundExtractor) {
      return (foundExtractor as (raw: any) => any[])(this.raw) || [];
    }

    // Fallback: lookup via getValue
    const val = this.getValue(name);
    return Array.isArray(val) ? val : [];
  }

  /**
   * Lists all registered keys with their types and live sample values
   */
  listAvailableKeys(): AvailableKey[] {
    const result: AvailableKey[] = [];

    // 1. Scalar & object keys
    this.customGetters.forEach((getter, key) => {
      let sampleValue: any;
      try {
        sampleValue = getter(this.raw);
      } catch {
        sampleValue = undefined;
      }

      const meta = this.keyMeta.get(key);
      const inferredType: KeyDataType =
        meta?.type ||
        (typeof sampleValue === 'number'
          ? 'number'
          : sampleValue instanceof Date
            ? 'date'
            : typeof sampleValue === 'boolean'
              ? 'boolean'
              : 'string');

      result.push({
        key,
        label: meta?.label || key.replace(/[._]/g, ' ').toUpperCase(),
        type: inferredType,
        sampleValue,
        category: meta?.category || 'Document Values',
      });
    });

    // 2. Collections and their item fields
    this.collections.forEach((extractor, colName) => {
      const options = this.collectionOptionsMap.get(colName) || {};
      const prefix = options.itemPrefix || 'item';
      let sampleList: any[] = [];
      try {
        sampleList = extractor(this.raw) || [];
      } catch {
        sampleList = [];
      }

      const firstRow = sampleList.length > 0 ? sampleList[0] : {};
      const itemFields: AvailableKey[] = [];

      // Determine fields either from declared options or by auto-introspecting firstRow
      const declaredFields = options.fields || [];
      const discoveredKeys = new Set<string>();

      // A. Declared item fields
      declaredFields.forEach((f: CollectionItemField) => {
        discoveredKeys.add(f.key.toLowerCase());
        const sample = firstRow ? firstRow[f.key] : undefined;
        itemFields.push({
          key: `${prefix}.${f.key}`,
          label: f.label || `${prefix.toUpperCase()} ${f.key}`,
          type: f.type || (typeof sample === 'number' ? 'number' : 'string'),
          sampleValue: sample,
          isCollectionItem: true,
          collectionName: colName,
          category: options.category || `${colName.toUpperCase()} Line Items`,
        });
      });

      // B. Auto-introspect any extra keys present on the first row
      if (firstRow && typeof firstRow === 'object') {
        Object.keys(firstRow).forEach((rowProp) => {
          if (!discoveredKeys.has(rowProp.toLowerCase())) {
            const sample = firstRow[rowProp];
            itemFields.push({
              key: `${prefix}.${rowProp}`,
              label: `${prefix.toUpperCase()} ${rowProp.replace(/[._]/g, ' ')}`,
              type: typeof sample === 'number' ? 'number' : 'string',
              sampleValue: sample,
              isCollectionItem: true,
              collectionName: colName,
              category: options.category || `${colName.toUpperCase()} Line Items`,
            });
          }
        });
      }

      result.push({
        key: colName,
        label: options.label || `${colName.toUpperCase()} (Table Array)`,
        type: 'array',
        sampleValue: `[${sampleList.length} rows]`,
        category: options.category || 'Tables & Arrays',
        fields: itemFields,
      });
    });

    return result;
  }

  /**
   * Returns a flattened list of all available keys, including individual array fields (e.g. item.Name, item.SalePrice)
   * Perfect for tag pickers and template key autocomplete!
   */
  listFlattenedKeys(): AvailableKey[] {
    const structured = this.listAvailableKeys();
    const flat: AvailableKey[] = [];

    structured.forEach((k) => {
      if (k.type === 'array' && k.fields && k.fields.length > 0) {
        flat.push(k);
        k.fields.forEach((child) => flat.push(child));
      } else {
        flat.push(k);
      }
    });

    return flat;
  }
}
