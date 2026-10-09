import { DynamicDataModel } from '../model/DynamicDataModel';
import { formatDecimal, formatINR, numberToWordsINR } from '../formatters/currency';
import { formatDate } from '../formatters/dates';

/**
 * Applies pipe formatters: e.g. {{ total_amount | inWords }} or {{ doc_date | date }}
 */
function applyPipe(val: any, pipe: string): string {
  const cleanPipe = pipe.trim().toLowerCase();
  if (cleanPipe === 'inwords' || cleanPipe === 'inwordsinr') {
    return numberToWordsINR(val);
  }
  if (cleanPipe === 'currency' || cleanPipe === 'inr') {
    return formatINR(val);
  }
  if (cleanPipe === 'decimal' || cleanPipe === 'number') {
    return formatDecimal(val);
  }
  if (cleanPipe === 'uppercase') {
    return String(val || '').toUpperCase();
  }
  if (cleanPipe === 'lowercase') {
    return String(val || '').toLowerCase();
  }
  if (cleanPipe.startsWith('date')) {
    return formatDate(val);
  }
  return val !== undefined && val !== null ? String(val) : '';
}

/**
 * Resolves a value expression from either a row item or the parent data model
 */
function resolveToken(tokenExpr: string, rowItem?: any, model?: DynamicDataModel): string {
  const parts = tokenExpr.split('|');
  const rawPath = parts[0].trim();
  const pipe = parts[1] ? parts[1].trim() : null;

  let val: any = undefined;

  // 1. If inside an array row item, check row item properties first
  if (rowItem && typeof rowItem === 'object') {
    // Strip "item." or "items." prefix if present
    const cleanProp = rawPath.replace(/^items?\./i, '');

    if (rowItem[cleanProp] !== undefined) {
      val = rowItem[cleanProp];
    } else {
      // Case-insensitive lookup on row item
      const lower = cleanProp.toLowerCase();
      for (const k of Object.keys(rowItem)) {
        if (k.toLowerCase() === lower) {
          val = rowItem[k];
          break;
        }
      }
    }
  }

  // 2. If not found on row item, check parent model
  if (val === undefined && model) {
    val = model.getValue(rawPath);
  }

  if (pipe && val !== undefined) {
    return applyPipe(val, pipe);
  }

  return val !== undefined && val !== null ? String(val) : '';
}

/**
 * Evaluates truthiness of a path within current context (row item, extra context, or model)
 */
function resolveConditionValue(path: string, rowItem?: any, model?: DynamicDataModel, extraContext?: Record<string, any>): any {
  const cleanPath = path.trim().replace(/^if\s+/i, '');
  if (rowItem && typeof rowItem === 'object') {
    const cleanProp = cleanPath.replace(/^items?\./i, '');
    if (rowItem[cleanProp] !== undefined) return rowItem[cleanProp];
  }
  if (extraContext && extraContext[cleanPath] !== undefined) {
    return extraContext[cleanPath];
  }
  if (model) {
    return model.getValue(cleanPath);
  }
  return undefined;
}

/**
 * Recursive block renderer supporting conditionals, loops, and scalar interpolation
 */
function renderBlock(
  templateHtml: string,
  rowItem?: any,
  model?: DynamicDataModel,
  extraContext?: Record<string, any>
): string {
  if (!templateHtml) return '';
  let output = templateHtml;

  // 1. Conditionals: {{#if path}} ... {{/if}}
  const ifRegex = /\{\{#if\s+([\w.]+)\}\}([\s\S]*?)\{\{\/if\}\}/g;
  output = output.replace(ifRegex, (_, path, content) => {
    const val = resolveConditionValue(path, rowItem, model, extraContext);
    return val ? renderBlock(content, rowItem, model, extraContext) : '';
  });

  // 2. Sections: {{#path}} ... {{/path}}
  // Could be either a collection loop or a truthy condition
  const sectionRegex = /\{\{#([\w.]+)\}\}([\s\S]*?)\{\{\/\1\}\}/g;
  output = output.replace(sectionRegex, (_, path, content) => {
    const isCollection =
      (extraContext && Array.isArray(extraContext[path])) ||
      (model && typeof (model as any).hasCollection === 'function' && (model as any).hasCollection(path));

    if (isCollection) {
      const list =
        extraContext && Array.isArray(extraContext[path])
          ? extraContext[path]
          : model?.getCollection(path);

      if (!list || list.length === 0) return '';
      const startIndex = extraContext?.itemStartIndex ?? 0;
      return list
        .map((item: any, idx: number) => {
          return renderBlock(content, item, model, {
            ...extraContext,
            itemStartIndex: startIndex,
            itemIndex: startIndex + idx + 1,
          });
        })
        .join('');
    }

    // Otherwise evaluate as truthy section
    const val = resolveConditionValue(path, rowItem, model, extraContext);
    return val ? renderBlock(content, rowItem, model, extraContext) : '';
  });

  // 3. Inverted sections: {{^path}} ... {{/path}}
  const invertedRegex = /\{\{\^([\w.]+)\}\}([\s\S]*?)\{\{\/\1\}\}/g;
  output = output.replace(invertedRegex, (_, path, content) => {
    const isCollection =
      (extraContext && Array.isArray(extraContext[path])) ||
      (model && typeof (model as any).hasCollection === 'function' && (model as any).hasCollection(path));

    if (isCollection) {
      const list =
        extraContext && Array.isArray(extraContext[path])
          ? extraContext[path]
          : model?.getCollection(path);

      return !list || list.length === 0 ? renderBlock(content, rowItem, model, extraContext) : '';
    }

    const val = resolveConditionValue(path, rowItem, model, extraContext);
    return !val ? renderBlock(content, rowItem, model, extraContext) : '';
  });

  // 4. Scalar tokens: {{ token }} (with automatic currency symbol deduplication)
  const scalarRegex = /(₹?)\{\{([^}]+)\}\}/g;
  output = output.replace(scalarRegex, (match, rupeePrefix, expr) => {
    const trimmed = expr.trim();
    if (trimmed.startsWith('#') || trimmed.startsWith('/') || trimmed.startsWith('^')) return match;

    // Check special loop indices
    if (
      trimmed === 'item.Index' ||
      trimmed === 'Index' ||
      trimmed === 'item.index' ||
      trimmed === 'index'
    ) {
      return String(extraContext?.itemIndex ?? 1);
    }

    const parts = trimmed.split('|');
    const rawPath = parts[0].trim();
    const pipe = parts[1] ? parts[1].trim() : null;

    let res: string = '';
    if (extraContext && extraContext[rawPath] !== undefined) {
      const val = extraContext[rawPath];
      res = pipe ? applyPipe(val, pipe) : String(val);
    } else {
      res = resolveToken(trimmed, rowItem, model);
    }

    if (rupeePrefix === '₹') {
      if (res.startsWith('₹')) return res;
      return '₹' + res;
    }
    return res;
  });

  return output;
}

/**
 * Renders an HTML string template using the DynamicDataModel
 */
export function interpolateTemplate(
  templateHtml: string,
  model: DynamicDataModel,
  extraContext?: Record<string, any>
): string {
  return renderBlock(templateHtml, undefined, model, extraContext);
}
