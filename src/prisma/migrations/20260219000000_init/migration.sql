-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "hotspot_routers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "host" TEXT NOT NULL,
    "port" INTEGER NOT NULL DEFAULT 8728,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "useHttps" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hotspot_routers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hotspot_profiles" (
    "id" TEXT NOT NULL,
    "routerId" TEXT NOT NULL,
    "mikrotikId" TEXT,
    "name" TEXT NOT NULL,
    "rateLimit" TEXT NOT NULL DEFAULT '0/0',
    "sharedUsers" INTEGER NOT NULL DEFAULT 1,
    "sessionTimeout" TEXT,
    "idleTimeout" TEXT,
    "addressPool" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hotspot_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hotspot_users" (
    "id" TEXT NOT NULL,
    "routerId" TEXT NOT NULL,
    "profileId" TEXT,
    "mikrotikId" TEXT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "macAddress" TEXT,
    "ipAddress" TEXT,
    "limitUptime" TEXT,
    "limitBytes" BIGINT,
    "comment" TEXT,
    "disabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hotspot_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hotspot_vouchers" (
    "id" TEXT NOT NULL,
    "routerId" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "usedBy" TEXT,
    "usedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hotspot_vouchers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "hotspot_profiles_routerId_name_key" ON "hotspot_profiles"("routerId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "hotspot_users_routerId_username_key" ON "hotspot_users"("routerId", "username");

-- CreateIndex
CREATE UNIQUE INDEX "hotspot_vouchers_code_key" ON "hotspot_vouchers"("code");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hotspot_profiles" ADD CONSTRAINT "hotspot_profiles_routerId_fkey" FOREIGN KEY ("routerId") REFERENCES "hotspot_routers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hotspot_users" ADD CONSTRAINT "hotspot_users_routerId_fkey" FOREIGN KEY ("routerId") REFERENCES "hotspot_routers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hotspot_users" ADD CONSTRAINT "hotspot_users_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "hotspot_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hotspot_vouchers" ADD CONSTRAINT "hotspot_vouchers_routerId_fkey" FOREIGN KEY ("routerId") REFERENCES "hotspot_routers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hotspot_vouchers" ADD CONSTRAINT "hotspot_vouchers_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "hotspot_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
