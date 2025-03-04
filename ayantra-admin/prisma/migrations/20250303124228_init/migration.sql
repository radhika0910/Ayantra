-- CreateTable
CREATE TABLE "drivers" (
    "id" SERIAL NOT NULL,
    "first_name" VARCHAR(50) NOT NULL,
    "last_name" VARCHAR(50) NOT NULL,
    "profile_image_url" TEXT,
    "car_image_url" TEXT,
    "car_seats" INTEGER NOT NULL,
    "rating" DECIMAL(3,2) NOT NULL,

    CONSTRAINT "drivers_pkey" PRIMARY KEY ("id")
);
