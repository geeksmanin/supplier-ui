import { TemplateDefinition } from './types';

export class TemplateResolver {
  private templates: Map<string, TemplateDefinition> = new Map();

  constructor(initialTemplates: TemplateDefinition[] = []) {
    initialTemplates.forEach((t) => this.register(t));
  }

  register(template: TemplateDefinition): this {
    this.templates.set(template.id, template);
    return this;
  }

  get(id: string): TemplateDefinition | undefined {
    return this.templates.get(id);
  }

  getAll(): TemplateDefinition[] {
    return Array.from(this.templates.values());
  }

  /**
   * Resolves active templates matching a document series
   */
  getTemplatesForSeries(series: string, includeInactive: boolean = false): TemplateDefinition[] {
    const cleanSeries = (series || '').toUpperCase().trim();
    return Array.from(this.templates.values()).filter((tpl) => {
      if (!includeInactive && !tpl.isActive) return false;
      return tpl.series.some((s) => s === '*' || s.toUpperCase().trim() === cleanSeries);
    });
  }

  /**
   * Toggles active state of a template
   */
  setTemplateActive(id: string, isActive: boolean): boolean {
    const tpl = this.templates.get(id);
    if (!tpl) return false;
    tpl.isActive = isActive;
    return true;
  }
}
