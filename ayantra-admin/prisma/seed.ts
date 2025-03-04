// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.drivers.deleteMany({});

  // Create sample drivers
  const sampleDrivers = [
    {
      first_name: 'John',
      last_name: 'Doe',
      profile_image_url: 'https://randomuser.me/api/portraits/men/1.jpg',
      car_image_url: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=200',
      car_seats: 4,
      rating: 4.7,
    },
    {
      first_name: 'Jane',
      last_name: 'Smith',
      profile_image_url: 'https://randomuser.me/api/portraits/women/2.jpg',
      car_image_url: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=200',
      car_seats: 5,
      rating: 4.9,
    },
    {
      first_name: 'Michael',
      last_name: 'Johnson',
      profile_image_url: 'https://randomuser.me/api/portraits/men/3.jpg',
      car_image_url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=200',
      car_seats: 2,
      rating: 3.8,
    },
    {
      first_name: 'Sarah',
      last_name: 'Williams',
      profile_image_url: 'https://randomuser.me/api/portraits/women/4.jpg',
      car_image_url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=200',
      car_seats: 4,
      rating: 4.2,
    },
    {
      first_name: 'Robert',
      last_name: 'Brown',
      profile_image_url: 'https://randomuser.me/api/portraits/men/5.jpg',
      car_image_url: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=200',
      car_seats: 6,
      rating: 4.5,
    },
  ];

  for (const driver of sampleDrivers) {
    await prisma.drivers.create({
      data: driver,
    });
  }

  console.log('Database has been seeded with sample drivers!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });