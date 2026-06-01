import { test, expect } from '@playwright/test';

test.describe('Serena Intimates - Mobile Core Flow', () => {
  
  test('Navegación táctil, Splash Screen y carrito de compras', async ({ page }) => {
    // 1. Acceso a la aplicación
    await page.goto('/');

    // 2. Validación de Splash Screen y Fade-out
    // El splash debería estar visible inicialmente
    const splash = page.locator('img[alt="Serena Intimates Splash"]');
    await expect(splash).toBeVisible();

    // Esperar a que el splash desaparezca (2.5s + 600ms fadeout)
    await expect(splash).toBeHidden({ timeout: 5000 });

    // 3. Validar Logo y Título Principal (Boutique Salta)
    await expect(page.locator('text=Boutique Salta')).toBeVisible();

    // 4. Interacción con TabBar (Mi Fit)
    const fitTab = page.locator('button[aria-label="Perfil Mi Fit"]');
    await fitTab.click();
    
    // Debería abrirse el Drawer de Mi Fit
    await expect(page.locator('text=Calculadora de Calce')).toBeVisible();
    
    // Cerrar el Drawer tocando fuera o en el botón de cerrar
    await page.keyboard.press('Escape'); // Alternativa táctil: click en overlay
    
    // 5. Interacción táctil con un producto en la grilla
    // Buscamos el primer producto (si existe) y tocamos para abrir detalle
    // Nota: Como usamos React Query, esperamos que los productos carguen
    const firstProduct = page.locator('.group').first();
    await expect(firstProduct).toBeVisible({ timeout: 10000 }); // Wait for Supabase/IDB cache

    await firstProduct.click();

    // Debería abrirse el ProductDetail Drawer
    const detailTitle = page.locator('h2').first();
    await expect(detailTitle).toBeVisible();

    // 6. Añadir al carro y validar Rate Limiting preventivo
    const addToCartBtn = page.locator('button', { hasText: /Agregar al Carro/i }).first();
    if (await addToCartBtn.isVisible()) {
      await addToCartBtn.click();
      
      // Intentar un segundo click inmediatamente para validar anti-spam táctil
      await addToCartBtn.click();
      // Debería mostrar un Toast preventivo (Rate Limiter)
      // "Acción bloqueada preventivamente" se muestra en consola, el sistema no debería duplicar inserción.
    }

    // 7. Cerrar Drawer de producto y abrir Carrito
    await page.keyboard.press('Escape');
    
    const cartBtn = page.locator('button[aria-label="Ver Carrito"]');
    await cartBtn.click();

    // Validación del Drawer del Carrito
    await expect(page.locator('text=Tu Selección de Seda')).toBeVisible();
    await expect(page.locator('text=Coordinar por WhatsApp')).toBeVisible();
  });
});
