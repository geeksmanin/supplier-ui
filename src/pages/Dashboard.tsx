import React, { useEffect, useState } from 'react';
import { apiClient } from '@geeksman/core-ui';

export function Dashboard() {
  const [productCount, setProductCount] = useState<number | string>('...');
  const [skuCount, setSkuCount] = useState<number | string>('...');
  const [categoryCount, setCategoryCount] = useState<number | string>('...');

  useEffect(() => {
    // Fetch live product stats from backend
    apiClient
      .get('/rfq/vendor-products', { params: { limit: 100 } })
      .then((res: any) => {
        const products = res.data?.data || res.data || [];
        setProductCount(products.length);

        let skus = 0;
        const categories = new Set<string>();
        
        products.forEach((p: any) => {
          skus += (p.variants?.length || 0);
          if (p.category) {
            categories.add(p.category.trim());
          }
        });
        
        setSkuCount(skus);
        setCategoryCount(categories.size);
      })
      .catch((err) => {
        console.error('Failed to load dashboard stats:', err);
        setProductCount(0);
        setSkuCount(0);
        setCategoryCount(0);
      });
  }, []);

  const styles = {
    container: {
      fontFamily: '"Outfit", "Inter", sans-serif',
      color: '#1e293b',
    },
    headerSection: {
      marginBottom: '2rem',
    },
    title: {
      fontSize: '1.75rem',
      fontWeight: 800,
      color: '#0f172a',
      margin: '0 0 0.5rem 0',
    },
    subtitle: {
      fontSize: '0.875rem',
      color: '#64748b',
      margin: 0,
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '1.5rem',
      marginBottom: '2rem',
    },
    card: (borderColor: string) => ({
      backgroundColor: '#ffffff',
      borderLeft: `4px solid ${borderColor}`,
      borderTop: '1px solid #e2e8f0',
      borderRight: '1px solid #e2e8f0',
      borderBottom: '1px solid #e2e8f0',
      borderRadius: '16px',
      padding: '1.5rem',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    }),
    cardLabel: {
      fontSize: '0.75rem',
      fontWeight: 700,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
      color: '#64748b',
      marginBottom: '0.5rem',
    },
    cardValue: {
      fontSize: '2.25rem',
      fontWeight: 800,
      color: '#0f172a',
      margin: '0.5rem 0',
    },
    cardDesc: {
      fontSize: '0.75rem',
      color: '#94a3b8',
      margin: 0,
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerSection}>
        <h1 style={styles.title}>Supplier Portal Dashboard</h1>
        <p style={styles.subtitle}>
          Manage your products, variant specifications, packings, and monitor catalogue listings.
        </p>
      </div>

      <div style={styles.grid}>
        <div style={styles.card('#2563eb')}>
          <div style={styles.cardLabel}>Total Products</div>
          <div style={styles.cardValue}>{productCount}</div>
          <div style={styles.cardDesc}>Across all categories</div>
        </div>

        <div style={styles.card('#10b981')}>
          <div style={styles.cardLabel}>Active SKUs</div>
          <div style={styles.cardValue}>{skuCount}</div>
          <div style={styles.cardDesc}>Currently visible in marketplace</div>
        </div>

        <div style={styles.card('#8b5cf6')}>
          <div style={styles.cardLabel}>Active Categories</div>
          <div style={styles.cardValue}>{categoryCount}</div>
          <div style={styles.cardDesc}>Product classification categories</div>
        </div>
      </div>
    </div>
  );
}
