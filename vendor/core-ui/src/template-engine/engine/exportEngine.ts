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
  scale: number = 2
): Promise<HTMLCanvasElement> {
  await waitForImagesToLoad(element);

  // Mount offscreen without any CSS transform ancestors
  const wrapper = document.createElement('div');
  wrapper.style.position = 'fixed';
  wrapper.style.left = '-10000px';
  wrapper.style.top = '0';
  wrapper.style.width = '210mm';
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
    const pkg = 'html2canvas';
    const h2cModule = await import(/* @vite-ignore */ pkg);
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
  options?: { scale?: number }
): Promise<Blob | null> {
  const canvas = await renderCleanElementCanvas(element, options?.scale || 2);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png', 0.95);
  });
}

/**
 * Compiles an array of page HTML elements into an A4 multi-page PDF Blob and jsPDF instance
 */
export async function exportPagesToPdfBlob(
  pageElements: HTMLElement[],
  options?: { quality?: number }
): Promise<Blob> {
  const pkg = 'jspdf';
  const jsPdfModule = await import(/* @vite-ignore */ pkg);
  const JsPdfClass = (jsPdfModule as any).jsPDF || (jsPdfModule as any).default || jsPdfModule;
  const pdf = new JsPdfClass({
    orientation: 'p',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  for (let i = 0; i < pageElements.length; i++) {
    const el = pageElements[i];

    if (i > 0) {
      pdf.addPage();
    }

    const canvas = await renderCleanElementCanvas(el, 2);
    const imgData = canvas.toDataURL('image/jpeg', options?.quality || 0.92);
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
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
