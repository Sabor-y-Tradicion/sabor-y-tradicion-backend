import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clean existing data
  await prisma.dish.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  await prisma.settings.deleteMany();
  await prisma.pageContent.deleteMany();

  console.log('✅ Cleaned existing data');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@sabor-tradicion.com',
      password: hashedPassword,
      name: 'Administrador',
      role: 'ADMIN',
    },
  });

  console.log('✅ Created admin user');

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Bebidas Calientes',
        slug: 'bebidas-calientes',
        description: 'Café, té y otras bebidas calientes',
        icon: '☕',
        order: 0,
        isActive: true,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Bebidas Frías',
        slug: 'bebidas-frias',
        description: 'Jugos, batidos y bebidas refrescantes',
        icon: '🥤',
        order: 1,
        isActive: true,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Desayunos',
        slug: 'desayunos',
        description: 'Desayunos tradicionales y nutritivos',
        icon: '🍳',
        order: 2,
        isActive: true,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Platos de Fondo',
        slug: 'platos-de-fondo',
        description: 'Platos principales de la casa',
        icon: '🍽️',
        order: 3,
        isActive: true,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Postres',
        slug: 'postres',
        description: 'Dulces y postres tradicionales',
        icon: '🍰',
        order: 4,
        isActive: true,
      },
    }),
  ]);

  console.log('✅ Created categories');

  // Create tags
  const tags = await Promise.all([
    prisma.tag.create({ data: { name: 'Vegetariano', slug: 'vegetariano' } }),
    prisma.tag.create({ data: { name: 'Vegano', slug: 'vegano' } }),
    prisma.tag.create({ data: { name: 'Sin Gluten', slug: 'sin-gluten' } }),
    prisma.tag.create({ data: { name: 'Picante', slug: 'picante' } }),
    prisma.tag.create({ data: { name: 'Recomendado', slug: 'recomendado' } }),
  ]);

  console.log('✅ Created tags');

  // Create dishes
  await prisma.dish.createMany({
    data: [
      // Bebidas Calientes
      {
        name: 'Café Americano',
        slug: 'cafe-americano',
        description: 'Café preparado de forma tradicional',
        price: 5.0,
        categoryId: categories[0].id,
        isActive: true,
        order: 0,
      },
      {
        name: 'Café con Leche',
        slug: 'cafe-con-leche',
        description: 'Café combinado con leche fresca',
        price: 6.0,
        categoryId: categories[0].id,
        isActive: true,
        order: 1,
      },
      {
        name: 'Té de Hierbas',
        slug: 'te-de-hierbas',
        description: 'Té natural de hierbas aromáticas',
        price: 4.5,
        categoryId: categories[0].id,
        isActive: true,
        isVegan: true,
        isVegetarian: true,
        order: 2,
      },
      // Bebidas Frías
      {
        name: 'Jugo de Naranja',
        slug: 'jugo-de-naranja',
        description: 'Jugo de naranja natural recién exprimido',
        price: 7.0,
        categoryId: categories[1].id,
        isActive: true,
        isVegan: true,
        isVegetarian: true,
        order: 0,
      },
      {
        name: 'Chicha Morada',
        slug: 'chicha-morada',
        description: 'Bebida tradicional peruana de maíz morado',
        price: 6.0,
        categoryId: categories[1].id,
        isActive: true,
        isVegan: true,
        isVegetarian: true,
        isFeatured: true,
        order: 1,
      },
      // Desayunos
      {
        name: 'Desayuno Chachapoyana',
        slug: 'desayuno-chachapoyana',
        description: 'Desayuno completo con huevos, pan, queso y café',
        price: 15.0,
        categoryId: categories[2].id,
        isActive: true,
        isFeatured: true,
        order: 0,
      },
      {
        name: 'Tamal Tradicional',
        slug: 'tamal-tradicional',
        description: 'Tamal casero preparado al estilo tradicional',
        price: 8.0,
        categoryId: categories[2].id,
        isActive: true,
        order: 1,
      },
      // Platos de Fondo
      {
        name: 'Caldo de Gallina',
        slug: 'caldo-de-gallina',
        description: 'Sopa reconfortante de gallina con fideos y papa',
        price: 18.0,
        categoryId: categories[3].id,
        isActive: true,
        isFeatured: true,
        order: 0,
      },
      {
        name: 'Seco de Res',
        slug: 'seco-de-res',
        description: 'Guiso tradicional de carne con cilantro',
        price: 22.0,
        categoryId: categories[3].id,
        isActive: true,
        order: 1,
      },
      {
        name: 'Arroz Chaufa Vegetariano',
        slug: 'arroz-chaufa-vegetariano',
        description: 'Arroz frito con verduras al estilo peruano',
        price: 16.0,
        categoryId: categories[3].id,
        isActive: true,
        isVegetarian: true,
        order: 2,
      },
      // Postres
      {
        name: 'Suspiro de Limeña',
        slug: 'suspiro-de-limena',
        description: 'Postre tradicional de manjar blanco con merengue',
        price: 10.0,
        categoryId: categories[4].id,
        isActive: true,
        isVegetarian: true,
        order: 0,
      },
      {
        name: 'Mazamorra Morada',
        slug: 'mazamorra-morada',
        description: 'Postre de maíz morado con frutas',
        price: 8.0,
        categoryId: categories[4].id,
        isActive: true,
        isVegan: true,
        isVegetarian: true,
        order: 1,
      },
    ],
  });

  console.log('✅ Created dishes');

  // Create settings
  await prisma.settings.createMany({
    data: [
      {
        key: 'restaurant_name',
        value: 'Sabor y Tradición',
        type: 'string',
      },
      {
        key: 'restaurant_phone',
        value: '+51 987 654 321',
        type: 'string',
      },
      {
        key: 'restaurant_email',
        value: 'info@sabor-tradicion.com',
        type: 'string',
      },
      {
        key: 'restaurant_address',
        value: 'Av. Principal 123, Chachapoyas, Amazonas',
        type: 'string',
      },
      {
        key: 'social_instagram',
        value: 'https://instagram.com/sabor-tradicion',
        type: 'string',
      },
      {
        key: 'social_facebook',
        value: 'https://facebook.com/sabor-tradicion',
        type: 'string',
      },
    ],
  });

  console.log('✅ Created settings');

  // Create page content
  await prisma.pageContent.createMany({
    data: [
      {
        page: 'about',
        section: 'hero',
        content: 'Bienvenido a Sabor y Tradición, donde cada plato cuenta una historia.',
      },
      {
        page: 'about',
        section: 'history',
        content:
          'Desde 2020, hemos estado sirviendo la mejor comida tradicional chachapoyana, preparada con recetas familiares transmitidas de generación en generación.',
      },
    ],
  });

  console.log('✅ Created page content');

  console.log('🎉 Seed completed successfully!');
  console.log(`📧 Admin email: admin@sabor-tradicion.com`);
  console.log(`🔑 Admin password: admin123`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

