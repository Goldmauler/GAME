-- CreateTable
CREATE TABLE "AuctionRoom" (
    "id" TEXT NOT NULL,
    "roomCode" TEXT NOT NULL,
    "hostName" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'lobby',
    "teams" JSONB NOT NULL,
    "players" JSONB NOT NULL,
    "playerIndex" INTEGER NOT NULL DEFAULT 0,
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "minTeams" INTEGER NOT NULL DEFAULT 2,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuctionRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaderboardEntry" (
    "id" TEXT NOT NULL,
    "roomCode" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "teamName" TEXT NOT NULL,
    "finalRating" DOUBLE PRECISION NOT NULL,
    "totalSpent" DOUBLE PRECISION NOT NULL,
    "budgetLeft" DOUBLE PRECISION NOT NULL,
    "playersCount" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeaderboardEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserStats" (
    "id" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalAuctions" INTEGER NOT NULL DEFAULT 0,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "topThree" INTEGER NOT NULL DEFAULT 0,
    "totalSpent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "highestRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "bestTeam" JSONB,
    "recentRooms" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerPurchase" (
    "id" TEXT NOT NULL,
    "roomCode" TEXT NOT NULL,
    "playerName" TEXT NOT NULL,
    "playerRole" TEXT NOT NULL,
    "basePrice" DOUBLE PRECISION NOT NULL,
    "soldPrice" DOUBLE PRECISION NOT NULL,
    "teamId" TEXT NOT NULL,
    "teamName" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlayerPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AuctionRoom_roomCode_key" ON "AuctionRoom"("roomCode");

-- CreateIndex
CREATE INDEX "AuctionRoom_roomCode_idx" ON "AuctionRoom"("roomCode");

-- CreateIndex
CREATE INDEX "AuctionRoom_status_idx" ON "AuctionRoom"("status");

-- CreateIndex
CREATE INDEX "AuctionRoom_createdAt_idx" ON "AuctionRoom"("createdAt");

-- CreateIndex
CREATE INDEX "LeaderboardEntry_roomCode_idx" ON "LeaderboardEntry"("roomCode");

-- CreateIndex
CREATE INDEX "LeaderboardEntry_userName_idx" ON "LeaderboardEntry"("userName");

-- CreateIndex
CREATE INDEX "LeaderboardEntry_finalRating_idx" ON "LeaderboardEntry"("finalRating");

-- CreateIndex
CREATE INDEX "LeaderboardEntry_completedAt_idx" ON "LeaderboardEntry"("completedAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserStats_userName_key" ON "UserStats"("userName");

-- CreateIndex
CREATE UNIQUE INDEX "UserStats_userId_key" ON "UserStats"("userId");

-- CreateIndex
CREATE INDEX "UserStats_userName_idx" ON "UserStats"("userName");

-- CreateIndex
CREATE INDEX "UserStats_avgRating_idx" ON "UserStats"("avgRating");

-- CreateIndex
CREATE INDEX "UserStats_wins_idx" ON "UserStats"("wins");

-- CreateIndex
CREATE INDEX "PlayerPurchase_roomCode_idx" ON "PlayerPurchase"("roomCode");

-- CreateIndex
CREATE INDEX "PlayerPurchase_playerName_idx" ON "PlayerPurchase"("playerName");

-- CreateIndex
CREATE INDEX "PlayerPurchase_teamName_idx" ON "PlayerPurchase"("teamName");

-- CreateIndex
CREATE INDEX "PlayerPurchase_purchasedAt_idx" ON "PlayerPurchase"("purchasedAt");

-- AddForeignKey
ALTER TABLE "LeaderboardEntry" ADD CONSTRAINT "LeaderboardEntry_roomCode_fkey" FOREIGN KEY ("roomCode") REFERENCES "AuctionRoom"("roomCode") ON DELETE CASCADE ON UPDATE CASCADE;
