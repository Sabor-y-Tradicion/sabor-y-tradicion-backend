import { PrismaClient } from '@prisma/client';
import { UpdateHomeConfigInput, UpdateAboutConfigInput } from '../validators/website.validator';

const prisma = new PrismaClient();

// Configuración por defecto del sitio web
const getDefaultWebConfig = (tenantName: string) => ({
  home: {
    hero: {
      title: `Bienvenido a ${tenantName}`,
      subtitle: 'Descubre nuestra deliciosa comida',
      imageUrl: '/images/default-hero.jpg',
      ctaText: 'Ver Menú',
      ctaLink: '/menu'
    },
    features: {
      enabled: false,
      items: []
    },
    carousel: {
      enabled: false,
      autoplay: true,
      interval: 5000,
      images: []
    }
  },
  about: {
    history: {
      enabled: false,
      title: 'Nuestra Historia',
      content: '',
      imageUrl: '/images/default-about.jpg'
    },
    mission: {
      enabled: false,
      title: 'Nuestra Misión',
      content: '',
      imageUrl: '/images/default-mission.jpg'
    },
    values: {
      enabled: false,
      title: 'Nuestros Valores',
      items: []
    }
  }
});

class WebsiteService {
  /**
   * Obtener configuración del sitio web de un tenant
   */
  async getWebsiteConfig(tenantId: string) {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        id: true,
        name: true,
        webConfig: true
      }
    });

    if (!tenant) {
      throw new Error('Tenant no encontrado');
    }

    // Si no hay configuración, devolver valores por defecto
    const webConfig = tenant.webConfig || getDefaultWebConfig(tenant.name);

    return webConfig;
  }

  /**
   * Obtener configuración pública del sitio web (sin autenticación)
   */
  async getPublicWebsiteConfig(tenantDomain: string) {
    const slug = tenantDomain.split('.')[0];

    const tenant = await prisma.tenant.findFirst({
      where: {
        OR: [
          { domain: tenantDomain },
          { customDomain: tenantDomain },
          { slug: slug }
        ],
        status: 'active'
      },
      select: {
        id: true,
        name: true,
        webConfig: true
      }
    });

    if (!tenant) {
      throw new Error('Restaurante no encontrado');
    }

    // Si no hay configuración, devolver valores por defecto
    const webConfig = tenant.webConfig || getDefaultWebConfig(tenant.name);

    return {
      tenantId: tenant.id,
      tenantName: tenant.name,
      config: webConfig
    };
  }

  /**
   * Actualizar configuración de Home
   */
  async updateHomeConfig(tenantId: string, data: UpdateHomeConfigInput) {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        id: true,
        name: true,
        webConfig: true
      }
    });

    if (!tenant) {
      throw new Error('Tenant no encontrado');
    }

    const currentConfig = (tenant.webConfig as any) || getDefaultWebConfig(tenant.name);

    // Actualizar solo la sección Home manteniendo el resto
    const newConfig = {
      ...currentConfig,
      home: {
        hero: data.hero || currentConfig.home?.hero,
        features: data.features || currentConfig.home?.features,
        carousel: data.carousel || currentConfig.home?.carousel
      }
    };

    const updatedTenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        webConfig: newConfig,
        updatedAt: new Date()
      },
      select: { webConfig: true }
    });

    return updatedTenant.webConfig;
  }

  /**
   * Actualizar configuración de About
   */
  async updateAboutConfig(tenantId: string, data: UpdateAboutConfigInput) {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        id: true,
        name: true,
        webConfig: true
      }
    });

    if (!tenant) {
      throw new Error('Tenant no encontrado');
    }

    const currentConfig = (tenant.webConfig as any) || getDefaultWebConfig(tenant.name);

    // Actualizar solo la sección About manteniendo el resto
    const newConfig = {
      ...currentConfig,
      about: {
        history: data.history || currentConfig.about?.history,
        mission: data.mission || currentConfig.about?.mission,
        values: data.values || currentConfig.about?.values
      }
    };

    const updatedTenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        webConfig: newConfig,
        updatedAt: new Date()
      },
      select: { webConfig: true }
    });

    return updatedTenant.webConfig;
  }

  /**
   * Actualizar configuración completa del sitio web
   */
  async updateFullConfig(tenantId: string, config: any) {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId }
    });

    if (!tenant) {
      throw new Error('Tenant no encontrado');
    }

    const updatedTenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        webConfig: config,
        updatedAt: new Date()
      },
      select: { webConfig: true }
    });

    return updatedTenant.webConfig;
  }

  /**
   * Inicializar configuración por defecto para un nuevo tenant
   */
  async initializeWebConfig(tenantId: string, tenantName: string) {
    const defaultConfig = getDefaultWebConfig(tenantName);

    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        webConfig: defaultConfig
      }
    });

    return defaultConfig;
  }
}

export default new WebsiteService();

