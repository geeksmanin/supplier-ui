import { TemplateDefinition } from './types';

/**
 * Ensures all <img> elements inside a container are completely loaded before capturing
 */
export async function waitForImagesToLoad(container: HTMLElement, timeoutMs: number = 4000): Promise<void> {
  const images = Array.from(container.getElementsByTagName('img'));
  if (images.length === 0) return;

  await Promise.all(
    images.map((img) => {
      if (img.complete && img.naturalHeight !== 0) {
        return Promise.resolve();
      }

      return new Promise<void>((resolve) => {
        let settled = false;
        const done = () => {
          if (!settled) {
            settled = true;
            resolve();
          }
        };

        const timer = setTimeout(done, timeoutMs);

        img.onload = () => {
          clearTimeout(timer);
          done();
        };

        img.onerror = () => {
          clearTimeout(timer);
          done();
        };
      });
    })
  );
}

/**
 * Triggers a browser file download from a Blob
 */
export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Renders an element cleanly by cloning it into an unscaled container to prevent
 * html2canvas coordinate shifting, font duplication, and ghosting caused by CSS transforms (e.g. scale(0.68)).
 */
async function renderCleanElementCanvas(
  element: HTMLElement,
  scale: number = 2,
  format?: string
): Promise<HTMLCanvasElement> {
  await waitForImagesToLoad(element);

  const isA5 = format?.toLowerCase() === 'a5';
  const isThermal = format?.toLowerCase().includes('thermal');

  // Mount offscreen without any CSS transform ancestors
  const wrapper = document.createElement('div');
  wrapper.style.position = 'fixed';
  wrapper.style.left = '-10000px';
  wrapper.style.top = '0';
  wrapper.style.width = isThermal ? '380px' : isA5 ? '700px' : '1000px';
  wrapper.style.minHeight = isThermal ? 'auto' : isA5 ? '990px' : '1414px';
  wrapper.style.boxSizing = 'border-box';
  wrapper.style.transform = 'none';
  wrapper.style.zIndex = '-99999';
  wrapper.style.backgroundColor = '#ffffff';

  const clone = element.cloneNode(true) as HTMLElement;
  clone.style.transform = 'none';
  clone.style.margin = '0';
  clone.style.boxShadow = 'none';

  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  try {
    await waitForImagesToLoad(clone);
    const h2cModule = await import('html2canvas');
    const html2canvas = (h2cModule as any).default || h2cModule;
    return await html2canvas(clone, {
      scale,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false,
      imageTimeout: 10000,
    });
  } finally {
    wrapper.remove();
  }
}

/**
 * Captures an HTML element into a high-resolution PNG image Blob
 */
export async function exportPageToImageBlob(
  element: HTMLElement,
  options?: { scale?: number; format?: string }
): Promise<Blob | null> {
  const canvas = await renderCleanElementCanvas(element, options?.scale || 1.5, options?.format);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png', 0.95);
  });
}

/**
 * Compiles an array of page HTML elements into an A4/A5 multi-page PDF Blob and jsPDF instance
 */
export async function exportPagesToPdfBlob(
  pageElements: HTMLElement[],
  options?: { quality?: number; format?: string; orientation?: 'p' | 'l' }
): Promise<Blob> {
  const jsPdfModule = await import('jspdf');
  const JsPdfClass = (jsPdfModule as any).jsPDF || (jsPdfModule as any).default || jsPdfModule;
  const pdfFormat = options?.format ? options.format.toLowerCase() : 'a4';
  const pdf = new JsPdfClass({
    orientation: options?.orientation || 'p',
    unit: 'mm',
    format: pdfFormat,
    compress: true,
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  for (let i = 0; i < pageElements.length; i++) {
    const el = pageElements[i];

    if (i > 0) {
      pdf.addPage(pdfFormat, options?.orientation || 'p');
    }

    const canvas = await renderCleanElementCanvas(el, 1.5, pdfFormat);
    const imgData = canvas.toDataURL('image/jpeg', options?.quality || 0.85);

    const canvasRatio = canvas.height / canvas.width;
    const expectedRatio = pdfHeight / pdfWidth; // ~1.4142857

    if (Math.abs(canvasRatio - expectedRatio) < 0.05) {
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
    } else {
      const renderedHeight = pdfWidth * canvasRatio;
      if (renderedHeight <= pdfHeight) {
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, renderedHeight, undefined, 'FAST');
      } else {
        const renderedWidth = pdfHeight / canvasRatio;
        const xOffset = (pdfWidth - renderedWidth) / 2;
        pdf.addImage(imgData, 'JPEG', xOffset, 0, renderedWidth, pdfHeight, undefined, 'FAST');
      }
    }
  }

  return pdf.output('blob');
}

/**
 * Serializes a template definition into commit-ready JSON or TypeScript source code
 */
export function generateTemplateCode(
  template: TemplateDefinition,
  format: 'json' | 'ts' = 'json'
): string {
  const serializable = {
    id: template.id,
    name: template.name,
    description: template.description || '',
    series: template.series,
    targetFormat: template.targetFormat,
    isActive: template.isActive,
    isSystemDefault: template.isSystemDefault ?? true,
    paginationConfig: template.paginationConfig || {
      firstPageMaxItems: 12,
      subsequentPageMaxItems: 18,
      lastPageMaxItemsWithSummary: 10,
    },
    content: template.content || '',
  };

  if (format === 'json') {
    return JSON.stringify(serializable, null, 2);
  }

  // TypeScript Code Format
  const varName = template.id.replace(/[^a-zA-Z0-9]/g, '_');

  if (template.render) {
    const compName =
      (template.render as any).displayName ||
      template.render.name ||
      'TemplateComponent';
    return `import { TemplateDefinition } from '@geeksman/core-ui';
import { ${compName} } from './${compName}';

export const ${varName}: TemplateDefinition = {
  id: ${JSON.stringify(template.id)},
  name: ${JSON.stringify(template.name)},
  description: ${JSON.stringify(template.description || '')},
  series: ${JSON.stringify(template.series)},
  targetFormat: ${JSON.stringify(template.targetFormat)},
  isActive: ${Boolean(template.isActive)},
  isSystemDefault: ${Boolean(template.isSystemDefault)},
  paginationConfig: ${JSON.stringify(
    template.paginationConfig || {
      firstPageMaxItems: 12,
      subsequentPageMaxItems: 18,
      lastPageMaxItemsWithSummary: 10,
    },
    null,
    2
  )},
  render: ${compName},
};
`;
  }

  return `import { TemplateDefinition } from '@geeksman/core-ui';

export const ${varName}: TemplateDefinition = {
  id: ${JSON.stringify(template.id)},
  name: ${JSON.stringify(template.name)},
  description: ${JSON.stringify(template.description || '')},
  series: ${JSON.stringify(template.series)},
  targetFormat: ${JSON.stringify(template.targetFormat)},
  isActive: ${Boolean(template.isActive)},
  isSystemDefault: ${Boolean(template.isSystemDefault)},
  paginationConfig: ${JSON.stringify(
    template.paginationConfig || {
      firstPageMaxItems: 12,
      subsequentPageMaxItems: 18,
      lastPageMaxItemsWithSummary: 10,
    },
    null,
    2
  )},
  content: ${JSON.stringify(template.content || '')},
};
`;
}

/**
 * Downloads the template definition directly as a .json or .ts file to commit to Git
 */
export function downloadTemplateCode(
  template: TemplateDefinition,
  format: 'json' | 'ts' = 'json'
): void {
  const code = generateTemplateCode(template, format);
  const ext = format === 'json' ? 'json' : 'ts';
  const mimeType = format === 'json' ? 'application/json' : 'text/typescript';
  const blob = new Blob([code], { type: mimeType });
  downloadBlob(blob, `${template.id}.${ext}`);
}
