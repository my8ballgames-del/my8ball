const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Cleaning existing database...");
  await prisma.auditLog.deleteMany();
  await prisma.dispute.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.userAchievement.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.ruleArticle.deleteMany();
  await prisma.fixture.deleteMany();
  await prisma.tournamentRegistration.deleteMany();
  await prisma.tournament.deleteMany();
  await prisma.leagueParticipant.deleteMany();
  await prisma.league.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.team.deleteMany();
  await prisma.ratingHistory.deleteMany();
  await prisma.matchFrame.deleteMany();
  await prisma.matchConfirmation.deleteMany();
  await prisma.match.deleteMany();
  await prisma.challenge.deleteMany();
  await prisma.userPrivacy.deleteMany();
  await prisma.userAvailability.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  console.log("Seeding Achievements...");
  const achievementsData = [
    {
      code: "FIRST_BREAK",
      title: "First Break",
      description: "Play your first registered competitive match on My8ball.",
      iconName: "Zap",
      category: "MATCHES",
      rarity: "COMMON",
      points: 25,
    },
    {
      code: "FIRST_VICTORY",
      title: "Opening Win",
      description: "Score your first confirmed match victory.",
      iconName: "Trophy",
      category: "MATCHES",
      rarity: "COMMON",
      points: 50,
    },
    {
      code: "BLACKBALL_SPECIALIST",
      title: "Blackball Specialist",
      description: "Win 5 matches played under official South African Blackball rules.",
      iconName: "ShieldCheck",
      category: "COMPETITION",
      rarity: "RARE",
      points: 100,
    },
    {
      code: "CLEAN_SWEEP",
      title: "Flawless Clearance",
      description: "Win a race-to-5 or greater match without dropping a single frame.",
      iconName: "Award",
      category: "STREAK",
      rarity: "EPIC",
      points: 200,
    },
    {
      code: "COMMUNITY_CHAMPION",
      title: "Community Champion",
      description: "Win a sanctioned local tournament or seasonal league championship.",
      iconName: "Crown",
      category: "TOURNAMENT",
      rarity: "LEGENDARY",
      points: 500,
    },
    {
      code: "TEAM_CAPTAIN",
      title: "Squad Leader",
      description: "Create and captain a competitive pool team.",
      iconName: "Users",
      category: "COMMUNITY",
      rarity: "RARE",
      points: 75,
    },
    {
      code: "DIAMOND_ELITE",
      title: "Diamond Division",
      description: "Reach a competitive Elo rating of 1,600 or higher.",
      iconName: "Sparkles",
      category: "RANKING",
      rarity: "LEGENDARY",
      points: 350,
    },
  ];

  const createdAchievements = {};
  for (const ach of achievementsData) {
    createdAchievements[ach.code] = await prisma.achievement.create({ data: ach });
  }

  console.log("Seeding Official Rules Library (Blackball SA First)...");
  const rulesData = [
    {
      slug: "table-layout-and-groups",
      category: "BLACKBALL_SA",
      title: "Table Layout & Ball Groups",
      summary: "Understanding the playing area, spot position, and ball set in Blackball 8-ball pool.",
      officialRuleText: "The game is played on a six-pocket table with one white cue-ball, seven red balls, seven yellow balls, and one black 8-ball. The black ball is placed on the 8-ball spot at the apex of the rack.",
      playerAdvice: "Ensure balls are racked tight in the triangle. The apex ball rests precisely on the black spot with the black ball placed in the center row.",
      foulPenalty: "Illegal rack must be re-racked before the break shot is taken.",
      practicalExample: "If the black ball is placed on the front apex during racking, the referee or opponent must call a re-rack before the break is executed.",
      orderIndex: 1,
    },
    {
      slug: "the-break-and-legal-requirements",
      category: "BLACKBALL_SA",
      title: "The Lag & Legal Break Shot",
      summary: "How to lag for break and the exact requirements for a legal opening shot in Blackball SA.",
      officialRuleText: "The break is determined by the lag. For a legal break, the player must either pocket at least one object ball OR cause at least four object balls to strike one or more cushions. If the break fails this test, it is deemed a non-legal break.",
      playerAdvice: "Hit the rack firmly with top spin or center ball. Never play a soft tap on the break.",
      foulPenalty: "Non-legal break gives the opponent the option to accept the table, re-rack and break, or re-rack and let the original player break again.",
      practicalExample: "Player A strikes the rack, pots nothing, and only three balls hit the cushions. This is an illegal break. Player B can take over or demand a re-rack.",
      orderIndex: 2,
    },
    {
      slug: "black-ball-on-the-break",
      category: "BLACKBALL_SA",
      title: "Potting the 8-Ball on the Break",
      summary: "What happens when the black ball is pocketed on the opening break shot.",
      officialRuleText: "If the 8-ball is pocketed on a legal break shot, the breaker has the choice of: (a) spotting the 8-ball and continuing their visit, or (b) re-racking all balls and breaking again. It is NOT an instant win or loss of frame.",
      playerAdvice: "Check your local league regulations. In standard Blackball SA, potting the black on the break is not an automatic win.",
      foulPenalty: "If the breaker pots the 8-ball AND scratches the cue ball, it is a foul. The incoming player can spot the 8-ball and take a free shot from baulk, or re-rack.",
      practicalExample: "Sipho smashes the break and the 8-ball drops cleanly into the corner. Under BSA rules, the balls are re-racked or the 8-ball is respotted for Sipho to continue.",
      orderIndex: 3,
    },
    {
      slug: "determining-groups",
      category: "BLACKBALL_SA",
      title: "Determining Groups (Red vs Yellow)",
      summary: "How colors are allocated after the break shot.",
      officialRuleText: "Groups are not decided merely by potting a ball on the break. The table remains open until a player legally pots a ball of a specific group in regular play after the break.",
      playerAdvice: "Even if you pot two reds and one yellow on the break, the table is open! You can legally choose to shoot at either red or yellow on your next shot.",
      foulPenalty: "If you pot your opponent's ball when the table is open without legally nominating/potting your chosen ball, visit ends.",
      practicalExample: "Player pots a red on the break. On the next shot, player targets a yellow and pots it. The player is now officially Yellows.",
      orderIndex: 4,
    },
    {
      slug: "free-shot-and-additional-visit",
      category: "BLACKBALL_SA",
      title: "The Free Shot & Penalty System",
      summary: "The defining Blackball rule: One free shot followed by the remaining visit.",
      officialRuleText: "Following any standard foul by an opponent, the incoming player receives ONE FREE SHOT followed by normal play. On the free shot, the player may legally strike and pot ANY ball on the table (including the opponent's ball or the 8-ball, provided the 8-ball is respotted if potted before the player's group is cleared).",
      playerAdvice: "Use the free shot tactically! You can use your opponent's ball to clear a cluster or pot your opponent's obstructing ball.",
      foulPenalty: "Foul gives one free shot + continuation visit (often colloquially referred to as 'two shots', but Blackball free shot rules apply).",
      practicalExample: "Tshepo fouls by cue scratch. Sipho places the cue ball anywhere in baulk, takes a free shot to blast away Tshepo's blocking ball into a pocket, and then retains his normal turn.",
      orderIndex: 5,
    },
    {
      slug: "loss-of-frame-situations",
      category: "BLACKBALL_SA",
      title: "Loss of Frame Fouls",
      summary: "Critical mistakes that immediately forfeit the frame in competitive Blackball play.",
      officialRuleText: "A player loses the frame immediately if they: (1) pot the 8-ball before all balls in their group are legally cleared, (2) pot the 8-ball and commit a foul on the same shot (such as cue ball scratch), (3) deliberately play out of turn or alter the table.",
      playerAdvice: "When on the black, always play with cue ball control. If the black goes in and the cue ball trickles into another pocket, the frame is lost immediately.",
      foulPenalty: "Immediate forfeiture of the frame to the opponent.",
      practicalExample: "Lufuno pots the 8-ball for the win, but the white cue ball rolls down table and scratches into the side pocket. Opponent automatically wins the frame.",
      orderIndex: 6,
    },
    {
      slug: "local-myths-vs-official-rules",
      category: "HOUSE_RULES",
      title: "South African Township Myths vs Official Rules",
      summary: "Debunking common street rules: 'Two shots carry', 'Scratch on black means game over', and more.",
      officialRuleText: "Official Blackball South Africa rules supersede street conventions in all sanctioned tournaments and leagues. 'Two shots carry' is NOT a valid Blackball rule. When a player pots on a free shot, they transition to their standard visit without accumulating leftover visits.",
      playerAdvice: "Always agree before a casual challenge whether you are playing Official Blackball SA rules or House Rules. On My8ball, competitive matches strictly follow the chosen sanctioned ruleset.",
      foulPenalty: "Attempting to enforce non-existent street rules results in referee warning.",
      practicalExample: "A player claims they still have 'another shot' after potting on their free shot and missing the next. BSA rules clarify: once you pot on a free shot, you enter your normal turn and a subsequent miss ends your inning.",
      orderIndex: 7,
    },
  ];

  for (const rule of rulesData) {
    await prisma.ruleArticle.create({ data: rule });
  }

  console.log("Seeding Users & Profiles...");
  const passwordHash = await bcrypt.hash("Password123!", 10);

  const usersList = [
    {
      email: "admin@my8ball.co.za",
      role: "SUPER_ADMIN",
      username: "admin_pro",
      displayName: "My8ball Chief Admin",
      town: "Polokwane",
      province: "Limpopo",
      club: "Limpopo Provincial Cue Guild",
      skillLevel: "PRO",
      rating: 1850,
      division: "ELITE",
      provisionalMatches: 24,
      matchesPlayed: 45,
      matchesWon: 39,
      matchesLost: 6,
      framesWon: 168,
      framesLost: 42,
      currentStreak: 8,
      bestStreak: 12,
      bio: "Platform Administrator & Provincial Blackball Technical Director.",
    },
    {
      email: "organizer@mpheni.co.za",
      role: "ORGANIZER",
      username: "mpheni_chief",
      displayName: "Tshifhiwa 'The Host' Nemutanzhela",
      town: "Mpheni",
      province: "Limpopo",
      club: "Mpheni Legends Pool Club",
      skillLevel: "ADVANCED",
      rating: 1420,
      division: "SILVER",
      provisionalMatches: 15,
      matchesPlayed: 28,
      matchesWon: 17,
      matchesLost: 11,
      framesWon: 98,
      framesLost: 74,
      currentStreak: 2,
      bestStreak: 5,
      bio: "Founder of the Mpheni Community Pool League. Organizing tournaments since 2018.",
    },
    {
      email: "kgothatso@my8ball.co.za",
      role: "PLAYER",
      username: "kgothatso_sniper",
      displayName: "Kgothatso 'The Sniper' Nemavhola",
      town: "Mpheni",
      province: "Limpopo",
      club: "Mpheni Legends Pool Club",
      skillLevel: "PRO",
      rating: 1680,
      division: "PLATINUM",
      provisionalMatches: 20,
      matchesPlayed: 34,
      matchesWon: 29,
      matchesLost: 5,
      framesWon: 142,
      framesLost: 49,
      currentStreak: 6,
      bestStreak: 11,
      bio: "Reigning Mpheni Town Champion. Blackball master with deadly cue ball precision.",
    },
    {
      email: "tshepo@my8ball.co.za",
      role: "PLAYER",
      username: "tshepo_ghost",
      displayName: "Tshepo 'Ghost' Baloyi",
      town: "Elim",
      province: "Limpopo",
      club: "Elim Cue Masters",
      skillLevel: "ADVANCED",
      rating: 1540,
      division: "GOLD",
      provisionalMatches: 18,
      matchesPlayed: 30,
      matchesWon: 21,
      matchesLost: 9,
      framesWon: 112,
      framesLost: 68,
      currentStreak: 3,
      bestStreak: 7,
      bio: "Elim pool hall captain. Fast player, specialized in combination shots and bank clears.",
    },
    {
      email: "lufuno@my8ball.co.za",
      role: "PLAYER",
      username: "lufuno_spin",
      displayName: "Lufuno 'Spin Doctor' Ramabulana",
      town: "Thohoyandou",
      province: "Limpopo",
      club: "Venda Royal Shooters",
      skillLevel: "ADVANCED",
      rating: 1490,
      division: "SILVER",
      provisionalMatches: 14,
      matchesPlayed: 24,
      matchesWon: 15,
      matchesLost: 9,
      framesWon: 89,
      framesLost: 61,
      currentStreak: 1,
      bestStreak: 6,
      bio: "Thohoyandou tactical player. Defensive master who waits for the opponent to blunder.",
    },
    {
      email: "sipho@my8ball.co.za",
      role: "PLAYER",
      username: "sipho_king",
      displayName: "Sipho 'The Blackball King' Dlamini",
      town: "Soweto",
      province: "Gauteng",
      club: "Orlando Pool Club",
      skillLevel: "PRO",
      rating: 1720,
      division: "DIAMOND",
      provisionalMatches: 22,
      matchesPlayed: 40,
      matchesWon: 33,
      matchesLost: 7,
      framesWon: 164,
      framesLost: 52,
      currentStreak: 5,
      bestStreak: 14,
      bio: "National competitor from Soweto. Multiple provincial championship titles.",
    },
    {
      email: "thabo@my8ball.co.za",
      role: "PLAYER",
      username: "thabo_ace",
      displayName: "Thabo '8-Ball Ace' Ndlovu",
      town: "Mpheni",
      province: "Limpopo",
      club: "Mpheni Legends Pool Club",
      skillLevel: "INTERMEDIATE",
      rating: 1390,
      division: "SILVER",
      provisionalMatches: 12,
      matchesPlayed: 19,
      matchesWon: 11,
      matchesLost: 8,
      framesWon: 67,
      framesLost: 58,
      currentStreak: 0,
      bestStreak: 4,
      bio: "Community player aiming for Gold division. Always up for a race to 5.",
    },
    {
      email: "ndivhuwo@my8ball.co.za",
      role: "PLAYER",
      username: "ndivhuwo_cue",
      displayName: "Ndivhuwo Madzhie",
      town: "Mpheni",
      province: "Limpopo",
      club: "Mpheni Legends Pool Club",
      skillLevel: "INTERMEDIATE",
      rating: 1220,
      division: "BRONZE",
      provisionalMatches: 8,
      matchesPlayed: 12,
      matchesWon: 5,
      matchesLost: 7,
      framesWon: 34,
      framesLost: 44,
      currentStreak: 1,
      bestStreak: 3,
      bio: "Learning Blackball SA tournament rules. Enthusiastic club regular.",
    },
  ];

  const dbUsers = {};

  for (const u of usersList) {
    const user = await prisma.user.create({
      data: {
        email: u.email,
        passwordHash,
        role: u.role,
        isVerified: true,
        profile: {
          create: {
            username: u.username,
            displayName: u.displayName,
            bio: u.bio,
            country: "South Africa",
            province: u.province,
            town: u.town,
            club: u.club,
            skillLevel: u.skillLevel,
            rating: u.rating,
            peakRating: u.rating + 40,
            division: u.division,
            provisionalMatches: u.provisionalMatches,
            matchesPlayed: u.matchesPlayed,
            matchesWon: u.matchesWon,
            matchesLost: u.matchesLost,
            framesWon: u.framesWon,
            framesLost: u.framesLost,
            currentStreak: u.currentStreak,
            bestStreak: u.bestStreak,
          },
        },
        availability: {
          create: {
            status: u.username === "kgothatso_sniper" || u.username === "tshepo_ghost" || u.username === "ndivhuwo_cue"
              ? "AVAILABLE_INDIVIDUAL"
              : u.username === "lufuno_spin"
              ? "IN_MATCH"
              : "ONLINE_UNAVAILABLE",
            isAvailable: u.username !== "lufuno_spin" && u.username !== "sipho_king",
            availableForIndividual: true,
            availableForTeam: true,
            preferredVenue: u.club,
            preferredRuleSet: "BLACKBALL_SA",
          },
        },
        privacy: {
          create: {
            locationVisibility: "TOWN",
            profileVisibility: "PUBLIC",
            allowChallenges: true,
            showStats: true,
          },
        },
      },
      include: { profile: true },
    });
    dbUsers[u.username] = user;

    // Award initial achievements
    await prisma.userAchievement.create({
      data: {
        userId: user.id,
        achievementId: createdAchievements["FIRST_BREAK"].id,
      },
    });

    if (u.matchesWon > 0) {
      await prisma.userAchievement.create({
        data: {
          userId: user.id,
          achievementId: createdAchievements["FIRST_VICTORY"].id,
        },
      });
    }

    if (u.rating >= 1600) {
      await prisma.userAchievement.create({
        data: {
          userId: user.id,
          achievementId: createdAchievements["DIAMOND_ELITE"].id,
        },
      });
    }
  }

  console.log("Seeding Teams (The 5 Mpheni & Regional Rivals)...");
  const teamsData = [
    {
      name: "Mpheni Cue Masters",
      slug: "mpheni-cue-masters",
      captainUsername: "kgothatso_sniper",
      town: "Mpheni",
      homeVenue: "Mpheni Legends Pool Club",
      rating: 1620,
      division: "PLATINUM",
      description: "Elite 8-ball powerhouse from Mpheni. Multiple-time township tournament victors.",
      members: ["kgothatso_sniper", "thabo_ace", "ndivhuwo_cue"],
    },
    {
      name: "Elim Blackball Titans",
      slug: "elim-blackball-titans",
      captainUsername: "tshepo_ghost",
      town: "Elim",
      homeVenue: "Elim Cue Arena",
      rating: 1540,
      division: "GOLD",
      description: "Disciplined tactical pool squad from Elim representing Limpopo competitive circuits.",
      members: ["tshepo_ghost"],
    },
    {
      name: "Venda Royal Shooters",
      slug: "venda-royal-shooters",
      captainUsername: "lufuno_spin",
      town: "Thohoyandou",
      homeVenue: "Thohoyandou Sports Bar",
      rating: 1480,
      division: "SILVER",
      description: "Fierce competitors known for long pot accuracy and relentless safety play.",
      members: ["lufuno_spin"],
    },
    {
      name: "Soweto 8-Ball Legends",
      slug: "soweto-8-ball-legends",
      captainUsername: "sipho_king",
      town: "Soweto",
      homeVenue: "Orlando Pool Club",
      rating: 1710,
      division: "DIAMOND",
      description: "Gauteng invitational champions bringing high-stakes tournament experience.",
      members: ["sipho_king"],
    },
    {
      name: "Limpopo Spin Hawks",
      slug: "limpopo-spin-hawks",
      captainUsername: "mpheni_chief",
      town: "Mpheni",
      homeVenue: "Mpheni Central Pub",
      rating: 1410,
      division: "SILVER",
      description: "Local veterans with decades of grassroots competition experience.",
      members: ["mpheni_chief"],
    },
  ];

  const dbTeams = {};
  for (const t of teamsData) {
    const captain = dbUsers[t.captainUsername];
    const team = await prisma.team.create({
      data: {
        name: t.name,
        slug: t.slug,
        captainId: captain.id,
        town: t.town,
        homeVenue: t.homeVenue,
        rating: t.rating,
        division: t.division,
        description: t.description,
        emblemUrl: "/assets/my8ball_logo.jpg",
      },
    });
    dbTeams[t.slug] = team;

    // Add members
    for (const memUsername of t.members) {
      const memUser = dbUsers[memUsername];
      await prisma.teamMember.create({
        data: {
          teamId: team.id,
          userId: memUser.id,
          role: memUsername === t.captainUsername ? "CAPTAIN" : "MEMBER",
        },
      });
    }

    // Award team captain badge
    await prisma.userAchievement.upsert({
      where: {
        userId_achievementId: {
          userId: captain.id,
          achievementId: createdAchievements["TEAM_CAPTAIN"].id,
        },
      },
      update: {},
      create: {
        userId: captain.id,
        achievementId: createdAchievements["TEAM_CAPTAIN"].id,
      },
    });
  }

  console.log("Seeding League & 5-Team Tournament (Mpheni Community Pool League)...");
  const organizer = dbUsers["mpheni_chief"];

  const mpheniLeague = await prisma.league.create({
    data: {
      name: "Mpheni Community Pool League",
      slug: "mpheni-community-pool-league",
      description: "Official monthly Blackball competition uniting local clubs and teams across Mpheni and surrounding villages.",
      location: "Mpheni Community",
      organizerId: organizer.id,
      competitionType: "TEAM",
      ruleset: "BLACKBALL_SA",
      format: "ROUND_ROBIN",
      raceTo: 5,
      pointsWin: 3,
      pointsDraw: 1,
      pointsLoss: 0,
      status: "ACTIVE",
      edition: 1,
      emblemUrl: "/assets/tournament_arena.jpg",
    },
  });

  // Add 5 teams as participants in Mpheni League
  const teamStandings = [
    { slug: "mpheni-cue-masters", points: 9, played: 3, wins: 3, draws: 0, losses: 0, fw: 15, fl: 4, standing: 1 },
    { slug: "soweto-8-ball-legends", points: 6, played: 3, wins: 2, draws: 0, losses: 1, fw: 12, fl: 7, standing: 2 },
    { slug: "elim-blackball-titans", points: 3, played: 2, wins: 1, draws: 0, losses: 1, fw: 7, fl: 6, standing: 3 },
    { slug: "venda-royal-shooters", points: 3, played: 2, wins: 1, draws: 0, losses: 1, fw: 6, fl: 8, standing: 4 },
    { slug: "limpopo-spin-hawks", points: 0, played: 2, wins: 0, draws: 0, losses: 2, fw: 2, fl: 10, standing: 5 },
  ];

  for (const s of teamStandings) {
    await prisma.leagueParticipant.create({
      data: {
        leagueId: mpheniLeague.id,
        teamId: dbTeams[s.slug].id,
        points: s.points,
        played: s.played,
        wins: s.wins,
        draws: s.draws,
        losses: s.losses,
        framesWon: s.fw,
        framesLost: s.fl,
        standing: s.standing,
      },
    });
  }

  console.log("Seeding One-Day 5-Team Tournament (Mpheni Monthly Invitational)...");
  const tournament = await prisma.tournament.create({
    data: {
      name: "Mpheni Monthly 8-Ball Invitational",
      slug: "mpheni-monthly-8-ball-invitational",
      organizerId: organizer.id,
      leagueId: mpheniLeague.id,
      location: "Mpheni Community Hall",
      venue: "Mpheni Legends Club Arena",
      ruleset: "BLACKBALL_SA",
      format: "GROUP_KNOCKOUT",
      type: "TEAM",
      raceTo: 5,
      numTables: 3,
      maxParticipants: 5,
      status: "IN_PROGRESS",
      posterUrl: "/assets/tournament_arena.jpg",
    },
  });

  // Register the 5 teams
  let seed = 1;
  for (const t of teamsData) {
    await prisma.tournamentRegistration.create({
      data: {
        tournamentId: tournament.id,
        teamId: dbTeams[t.slug].id,
        seed: seed++,
        status: "CONFIRMED",
      },
    });
  }

  // Create Fixtures for Table 1, Table 2, Table 3
  await prisma.fixture.create({
    data: {
      leagueId: mpheniLeague.id,
      tournamentId: tournament.id,
      round: "Round 1 - Morning",
      tableNumber: 1,
      team1Id: dbTeams["mpheni-cue-masters"].id,
      team2Id: dbTeams["elim-blackball-titans"].id,
      score1: 5,
      score2: 2,
      winnerId: dbTeams["mpheni-cue-masters"].captainId,
      status: "COMPLETED",
    },
  });

  await prisma.fixture.create({
    data: {
      leagueId: mpheniLeague.id,
      tournamentId: tournament.id,
      round: "Round 1 - Morning",
      tableNumber: 2,
      team1Id: dbTeams["soweto-8-ball-legends"].id,
      team2Id: dbTeams["venda-royal-shooters"].id,
      score1: 5,
      score2: 1,
      winnerId: dbTeams["soweto-8-ball-legends"].captainId,
      status: "COMPLETED",
    },
  });

  const liveFixture = await prisma.fixture.create({
    data: {
      leagueId: mpheniLeague.id,
      tournamentId: tournament.id,
      round: "Round 2 - Afternoon Semi-Final",
      tableNumber: 1,
      team1Id: dbTeams["mpheni-cue-masters"].id,
      team2Id: dbTeams["soweto-8-ball-legends"].id,
      score1: 3,
      score2: 2,
      status: "LIVE",
    },
  });

  console.log("Seeding Matches (Completed, Live, and Awaiting Confirmation)...");
  // 1. Live Match: Kgothatso vs Sipho (Race to 5, currently 3 - 2)
  const kgothatso = dbUsers["kgothatso_sniper"];
  const sipho = dbUsers["sipho_king"];
  const tshepo = dbUsers["tshepo_ghost"];
  const lufuno = dbUsers["lufuno_spin"];

  const liveMatch = await prisma.match.create({
    data: {
      type: "INDIVIDUAL",
      ruleset: "BLACKBALL_SA",
      raceTo: 5,
      status: "IN_PROGRESS",
      venue: "Mpheni Legends Club - Table 1",
      tableNumber: 1,
      player1Id: kgothatso.id,
      player2Id: sipho.id,
      team1Id: dbTeams["mpheni-cue-masters"].id,
      team2Id: dbTeams["soweto-8-ball-legends"].id,
      scorePlayer1: 3,
      scorePlayer2: 2,
      tournamentId: tournament.id,
      leagueId: mpheniLeague.id,
      startedAt: new Date(Date.now() - 45 * 60 * 1000), // 45 mins ago
      frames: {
        create: [
          {
            frameNumber: 1,
            winnerId: kgothatso.id,
            breakPlayerId: kgothatso.id,
            durationSeconds: 240,
            notes: "Kgothatso clearance after yellow pot on open table.",
          },
          {
            frameNumber: 2,
            winnerId: sipho.id,
            breakPlayerId: sipho.id,
            durationSeconds: 310,
            notes: "Sipho took advantage of Kgothatso cue ball scratch.",
            foulEvent: "FOUL_CUE_SCRATCH",
          },
          {
            frameNumber: 3,
            winnerId: kgothatso.id,
            breakPlayerId: kgothatso.id,
            durationSeconds: 215,
            notes: "Clinical runout from Kgothatso.",
          },
          {
            frameNumber: 4,
            winnerId: sipho.id,
            breakPlayerId: sipho.id,
            durationSeconds: 280,
            notes: "Sipho corner bank on the 8-ball.",
          },
          {
            frameNumber: 5,
            winnerId: kgothatso.id,
            breakPlayerId: kgothatso.id,
            durationSeconds: 195,
            notes: "Kgothatso free shot conversion.",
          },
        ],
      },
    },
  });

  // Link live fixture
  await prisma.fixture.update({
    where: { id: liveFixture.id },
    data: { matchId: liveMatch.id },
  });

  // Update Kgothatso & Sipho's activeMatchId
  await prisma.userAvailability.update({
    where: { userId: kgothatso.id },
    data: { status: "IN_MATCH", activeMatchId: liveMatch.id },
  });
  await prisma.userAvailability.update({
    where: { userId: sipho.id },
    data: { status: "IN_MATCH", activeMatchId: liveMatch.id },
  });

  // 2. Match awaiting result confirmation: Tshepo vs Lufuno
  const awaitingMatch = await prisma.match.create({
    data: {
      type: "INDIVIDUAL",
      ruleset: "BLACKBALL_SA",
      raceTo: 5,
      status: "AWAITING_CONFIRMATION",
      venue: "Elim Cue Arena - Table 2",
      tableNumber: 2,
      player1Id: tshepo.id,
      player2Id: lufuno.id,
      scorePlayer1: 5,
      scorePlayer2: 3,
      winnerId: tshepo.id,
      startedAt: new Date(Date.now() - 90 * 60 * 1000),
      endedAt: new Date(Date.now() - 15 * 60 * 1000),
      confirmation: {
        create: {
          player1Confirmed: true,
          player2Confirmed: false,
          player1ConfirmedAt: new Date(Date.now() - 10 * 60 * 1000),
          isConfirmed: false,
        },
      },
      frames: {
        create: [
          { frameNumber: 1, winnerId: tshepo.id, breakPlayerId: tshepo.id },
          { frameNumber: 2, winnerId: lufuno.id, breakPlayerId: lufuno.id },
          { frameNumber: 3, winnerId: tshepo.id, breakPlayerId: tshepo.id },
          { frameNumber: 4, winnerId: tshepo.id, breakPlayerId: lufuno.id },
          { frameNumber: 5, winnerId: lufuno.id, breakPlayerId: tshepo.id },
          { frameNumber: 6, winnerId: lufuno.id, breakPlayerId: lufuno.id },
          { frameNumber: 7, winnerId: tshepo.id, breakPlayerId: tshepo.id },
          { frameNumber: 8, winnerId: tshepo.id, breakPlayerId: lufuno.id },
        ],
      },
    },
  });

  // 3. Completed Historical Match: Kgothatso vs Tshepo with Rating History
  const completedMatch = await prisma.match.create({
    data: {
      type: "INDIVIDUAL",
      ruleset: "BLACKBALL_SA",
      raceTo: 5,
      status: "COMPLETED",
      venue: "Mpheni Legends Club",
      tableNumber: 1,
      player1Id: kgothatso.id,
      player2Id: tshepo.id,
      scorePlayer1: 5,
      scorePlayer2: 2,
      winnerId: kgothatso.id,
      startedAt: new Date(Date.now() - 24 * 3600 * 1000),
      endedAt: new Date(Date.now() - 23 * 3600 * 1000),
      confirmation: {
        create: {
          player1Confirmed: true,
          player2Confirmed: true,
          player1ConfirmedAt: new Date(Date.now() - 23 * 3600 * 1000),
          player2ConfirmedAt: new Date(Date.now() - 23 * 3600 * 1000),
          isConfirmed: true,
        },
      },
      ratingHistories: {
        create: [
          {
            userId: kgothatso.id,
            oldRating: 1664,
            newRating: 1680,
            change: 16,
            opponentId: tshepo.id,
            opponentRating: 1556,
          },
          {
            userId: tshepo.id,
            oldRating: 1556,
            newRating: 1540,
            change: -16,
            opponentId: kgothatso.id,
            opponentRating: 1664,
          },
        ],
      },
    },
  });

  console.log("Seeding Active Challenge...");
  // Thabo challenged Ndivhuwo
  await prisma.challenge.create({
    data: {
      challengerId: dbUsers["thabo_ace"].id,
      challengedId: dbUsers["ndivhuwo_cue"].id,
      type: "INDIVIDUAL",
      ruleset: "BLACKBALL_SA",
      raceTo: 5,
      isPlayNow: true,
      venue: "Mpheni Legends Pool Club",
      message: "Ready for our grudge match! First to 5 frames, BSA rules.",
      status: "PENDING",
      expiresAt: new Date(Date.now() + 2 * 3600 * 1000),
    },
  });

  console.log("Seeding Notifications...");
  await prisma.notification.create({
    data: {
      userId: dbUsers["ndivhuwo_cue"].id,
      type: "CHALLENGE_RECEIVED",
      title: "New Challenge from Thabo '8-Ball Ace'",
      message: "Thabo challenged you to a Race-to-5 Blackball match at Mpheni Legends.",
      link: "/challenges",
    },
  });

  await prisma.notification.create({
    data: {
      userId: lufuno.id,
      type: "RESULT_CONFIRMATION",
      title: "Result Confirmation Required",
      message: "Tshepo submitted a 5-3 victory in your recent match. Please review and confirm.",
      link: `/matches/${awaitingMatch.id}`,
    },
  });

  console.log("Database seeded successfully with authentic tournament, league, and player records!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
