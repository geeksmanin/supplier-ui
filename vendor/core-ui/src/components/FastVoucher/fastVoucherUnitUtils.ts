import { VoucherPackagingOption } from './FastVoucherEntryLayout.types';

/**
 * Safely parses `packings` / `packagings` arrays (including JSON-encoded strings from GORM datatypes.JSON).
 */
export function parsePackingsArray(raw: any): VoucherPackagingOption[] {
  if (!raw) return [];
  let arr: any = raw;
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed || trimmed === 'null' || trimmed === '[]') return [];
    try {
      arr = JSON.parse(trimmed);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(arr)) return [];
  return arr
    .filter((p) => p && (p.name || p.label || p.unit))
    .map((p) => ({
      name: String(p.name || p.label || p.unit).trim(),
      size: Number(p.size || p.conversion_factor || 1) || 1,
      is_default: Boolean(p.is_default),
    }));
}

/**
 * Resolves the canonical display unit from variant, nested parent product, or fallback fields.
 */
export function resolveCatalogUnit(item: any, parentProduct?: any): string {
  const candidate =
    item?.unit ||
    item?.base_unit ||
    item?.uom ||
    item?.packaging_name ||
    item?.product?.unit ||
    item?.product?.base_unit ||
    item?.product?.uom ||
    parentProduct?.unit ||
    parentProduct?.base_unit ||
    parentProduct?.uom ||
    '';
  return String(candidate).trim() || 'Unit';
}

/**
 * Resolves available packaging options and default UOM name/size from catalogue item and optional parent product.
 */
export function resolveCatalogPackagings(
  item: any,
  parentProduct?: any
): {
  packagings: VoucherPackagingOption[];
  defaultName: string;
  defaultSize: number;
} {
  const fromVariant = parsePackingsArray(item?.packings ?? item?.packagings);
  const fromProduct = parsePackingsArray(
    item?.product?.packings ??
      item?.product?.packagings ??
      parentProduct?.packings ??
      parentProduct?.packagings
  );
  const unitName = resolveCatalogUnit(item, parentProduct);
  const list = fromVariant.length > 0 ? fromVariant : fromProduct;

  if (list.length > 0) {
    const def = list.find((p) => p.is_default) || list[0];
    return {
      packagings: list,
      defaultName: def.name || unitName,
      defaultSize: Number(def.size) || 1,
    };
  }

  const size = Number(item?.packaging_size || 1) || 1;
  return {
    packagings: [{ name: unitName, size, is_default: true }],
    defaultName: unitName,
    defaultSize: size,
  };
}
