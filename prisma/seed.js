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
      practicalExample: "Boyka smashes the break and the 8-ball drops cleanly into the corner. Under BSA rules, the balls are re-racked or the 8-ball is respotted for Boyka to continue.",
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
      practicalExample: "Shoni fouls by cue scratch. Talifhani places the cue ball anywhere in baulk, takes a free shot to blast away Shoni's blocking ball, and then retains his normal turn.",
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

  console.log("Seeding Users & Profiles with Authentic Players...");
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
      email: "talifhani@my8ball.co.za",
      role: "PLAYER",
      username: "talifhani_boyka",
      displayName: "Talifhani (Boyka)",
      town: "Mpheni",
      province: "Limpopo",
      club: "Mpheni Legends Pool Club",
      skillLevel: "PRO",
      rating: 1780,
      division: "DIAMOND",
      provisionalMatches: 25,
      matchesPlayed: 42,
      matchesWon: 36,
      matchesLost: 6,
      framesWon: 172,
      framesLost: 48,
      currentStreak: 8,
      bestStreak: 15,
      bio: "Town Champion known for fearless break shots and uncompromising table clearances.",
    },
    {
      email: "lucky@my8ball.co.za",
      role: "PLAYER",
      username: "lucky_sniper",
      displayName: "Lucky Khosa (Sniper)",
      town: "Mpheni",
      province: "Limpopo",
      club: "Mpheni Cue Masters",
      skillLevel: "PRO",
      rating: 1710,
      division: "DIAMOND",
      provisionalMatches: 22,
      matchesPlayed: 38,
      matchesWon: 31,
      matchesLost: 7,
      framesWon: 154,
      framesLost: 56,
      currentStreak: 5,
      bestStreak: 12,
      bio: "Precision cue ball artist with long potting accuracy across the table.",
    },
    {
      email: "success@my8ball.co.za",
      role: "PLAYER",
      username: "success_godfather",
      displayName: "Success (The Godfather)",
      town: "Elim",
      province: "Limpopo",
      club: "Elim Blackball Titans",
      skillLevel: "PRO",
      rating: 1660,
      division: "PLATINUM",
      provisionalMatches: 20,
      matchesPlayed: 35,
      matchesWon: 28,
      matchesLost: 7,
      framesWon: 138,
      framesLost: 58,
      currentStreak: 4,
      bestStreak: 10,
      bio: "Tactical strategist and captain of Elim Blackball Titans. Master of safety snookers.",
    },
    {
      email: "shoni@my8ball.co.za",
      role: "PLAYER",
      username: "shoni_problem",
      displayName: "Shoni (The Problem)",
      town: "Thohoyandou",
      province: "Limpopo",
      club: "Venda Royal Shooters",
      skillLevel: "ADVANCED",
      rating: 1590,
      division: "GOLD",
      provisionalMatches: 18,
      matchesPlayed: 30,
      matchesWon: 22,
      matchesLost: 8,
      framesWon: 116,
      framesLost: 68,
      currentStreak: 3,
      bestStreak: 8,
      bio: "High-tempo attacking pool master creating problems for opponents on every visit.",
    },
    {
      email: "vhutshilo@my8ball.co.za",
      role: "PLAYER",
      username: "vhutshilo_gusba",
      displayName: "Vhutshilo (Gusba)",
      town: "Mpheni",
      province: "Limpopo",
      club: "Mpheni Legends Pool Club",
      skillLevel: "ADVANCED",
      rating: 1530,
      division: "GOLD",
      provisionalMatches: 16,
      matchesPlayed: 27,
      matchesWon: 19,
      matchesLost: 8,
      framesWon: 102,
      framesLost: 66,
      currentStreak: 2,
      bestStreak: 7,
      bio: "Mpheni regular with sharp banking shots and defensive composure.",
    },
    {
      email: "thabelo@my8ball.co.za",
      role: "PLAYER",
      username: "thabelo_caeser",
      displayName: "Thabelo (Caeser)",
      town: "Makhado",
      province: "Limpopo",
      club: "Makhado Cue Guild",
      skillLevel: "ADVANCED",
      rating: 1480,
      division: "SILVER",
      provisionalMatches: 15,
      matchesPlayed: 24,
      matchesWon: 16,
      matchesLost: 8,
      framesWon: 88,
      framesLost: 62,
      currentStreak: 1,
      bestStreak: 6,
      bio: "Ruler of the table under pressure, specialized in tight cushion cut-shots.",
    },
    {
      email: "lufuno@my8ball.co.za",
      role: "PLAYER",
      username: "lufuno_sbalo",
      displayName: "Lufuno (Sbalo)",
      town: "Thohoyandou",
      province: "Limpopo",
      club: "Venda Royal Shooters",
      skillLevel: "ADVANCED",
      rating: 1450,
      division: "SILVER",
      provisionalMatches: 14,
      matchesPlayed: 23,
      matchesWon: 15,
      matchesLost: 8,
      framesWon: 82,
      framesLost: 64,
      currentStreak: 2,
      bestStreak: 6,
      bio: "Venda cue master focused on patient positional control and frame management.",
    },
    {
      email: "owen@my8ball.co.za",
      role: "PLAYER",
      username: "owen_pool",
      displayName: "Owen",
      town: "Elim",
      province: "Limpopo",
      club: "Elim Cue Arena",
      skillLevel: "INTERMEDIATE",
      rating: 1390,
      division: "SILVER",
      provisionalMatches: 13,
      matchesPlayed: 20,
      matchesWon: 12,
      matchesLost: 8,
      framesWon: 68,
      framesLost: 58,
      currentStreak: 0,
      bestStreak: 5,
      bio: "Elim pool hall fighter aiming to reach the Gold tier this season.",
    },
    {
      email: "maguga@my8ball.co.za",
      role: "PLAYER",
      username: "maguga_andani",
      displayName: "Maguga Andani",
      town: "Mpheni",
      province: "Limpopo",
      club: "Mpheni Legends Pool Club",
      skillLevel: "INTERMEDIATE",
      rating: 1350,
      division: "SILVER",
      provisionalMatches: 12,
      matchesPlayed: 18,
      matchesWon: 10,
      matchesLost: 8,
      framesWon: 58,
      framesLost: 54,
      currentStreak: 1,
      bestStreak: 4,
      bio: "Steady and determined tournament contender from Mpheni.",
    },
    {
      email: "godfrey@my8ball.co.za",
      role: "PLAYER",
      username: "godfrey_ludere",
      displayName: "Godfrey Ludere",
      town: "Polokwane",
      province: "Limpopo",
      club: "Limpopo Spin Hawks",
      skillLevel: "INTERMEDIATE",
      rating: 1320,
      division: "BRONZE",
      provisionalMatches: 10,
      matchesPlayed: 16,
      matchesWon: 9,
      matchesLost: 7,
      framesWon: 52,
      framesLost: 48,
      currentStreak: 0,
      bestStreak: 4,
      bio: "Competitive player with deep passion for regional league fixtures.",
    },
    {
      email: "mrlee@my8ball.co.za",
      role: "PLAYER",
      username: "mr_lee_thanz",
      displayName: "Mr Lee (Thanz)",
      town: "Mpheni",
      province: "Limpopo",
      club: "Mpheni Central Pub",
      skillLevel: "INTERMEDIATE",
      rating: 1290,
      division: "BRONZE",
      provisionalMatches: 9,
      matchesPlayed: 15,
      matchesWon: 8,
      matchesLost: 7,
      framesWon: 48,
      framesLost: 46,
      currentStreak: 2,
      bestStreak: 4,
      bio: "Local club favorite with a knack for clutch 8-ball finishes.",
    },
    {
      email: "baseni@my8ball.co.za",
      role: "PLAYER",
      username: "baseni_mabasa",
      displayName: "Baseni Mabasa",
      town: "Elim",
      province: "Limpopo",
      club: "Elim Cue Arena",
      skillLevel: "INTERMEDIATE",
      rating: 1240,
      division: "BRONZE",
      provisionalMatches: 8,
      matchesPlayed: 14,
      matchesWon: 6,
      matchesLost: 8,
      framesWon: 40,
      framesLost: 49,
      currentStreak: 0,
      bestStreak: 3,
      bio: "Disciplined player working up the ranks of the Elim circuit.",
    },
    {
      email: "raymond@my8ball.co.za",
      role: "PLAYER",
      username: "raymond_tsaps",
      displayName: "Raymond Tsaps",
      town: "Mpheni",
      province: "Limpopo",
      club: "Mpheni Legends Pool Club",
      skillLevel: "BEGINNER",
      rating: 1180,
      division: "ROOKIE",
      provisionalMatches: 6,
      matchesPlayed: 10,
      matchesWon: 4,
      matchesLost: 6,
      framesWon: 28,
      framesLost: 38,
      currentStreak: 1,
      bestStreak: 2,
      bio: "Enthusiastic rookie improving game knowledge and Blackball SA rule mastery.",
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
            peakRating: u.rating + 35,
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
            status:
              u.username === "talifhani_boyka" || u.username === "lucky_sniper"
                ? "IN_MATCH"
                : u.username === "vhutshilo_gusba" || u.username === "thabelo_caeser"
                ? "AVAILABLE_INDIVIDUAL"
                : "AVAILABLE_BOTH",
            isAvailable: true,
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

  console.log("Seeding Teams with Authentic Player Rosters...");
  const teamsData = [
    {
      name: "Mpheni Cue Masters",
      slug: "mpheni-cue-masters",
      captainUsername: "talifhani_boyka",
      town: "Mpheni",
      homeVenue: "Mpheni Legends Pool Club",
      rating: 1720,
      division: "DIAMOND",
      description: "Premier 8-ball squad from Mpheni led by Talifhani (Boyka) and Lucky Khosa (Sniper).",
      members: ["talifhani_boyka", "lucky_sniper", "vhutshilo_gusba", "maguga_andani", "raymond_tsaps"],
    },
    {
      name: "Elim Blackball Titans",
      slug: "elim-blackball-titans",
      captainUsername: "success_godfather",
      town: "Elim",
      homeVenue: "Elim Cue Arena",
      rating: 1610,
      division: "PLATINUM",
      description: "Tactical pool squad from Elim captained by Success (The Godfather).",
      members: ["success_godfather", "owen_pool", "baseni_mabasa"],
    },
    {
      name: "Venda Royal Shooters",
      slug: "venda-royal-shooters",
      captainUsername: "shoni_problem",
      town: "Thohoyandou",
      homeVenue: "Thohoyandou Sports Bar",
      rating: 1540,
      division: "GOLD",
      description: "Aggressive clearing squad featuring Shoni (The Problem) and Lufuno (Sbalo).",
      members: ["shoni_problem", "lufuno_sbalo", "thabelo_caeser"],
    },
    {
      name: "Limpopo Spin Hawks",
      slug: "limpopo-spin-hawks",
      captainUsername: "godfrey_ludere",
      town: "Polokwane",
      homeVenue: "Polokwane Central Club",
      rating: 1380,
      division: "SILVER",
      description: "Provincial competitors known for high tactical discipline.",
      members: ["godfrey_ludere", "mr_lee_thanz"],
    },
    {
      name: "Mpheni Legends Squad",
      slug: "mpheni-legends-squad",
      captainUsername: "mpheni_chief",
      town: "Mpheni",
      homeVenue: "Mpheni Central Pub",
      rating: 1410,
      division: "SILVER",
      description: "Township club regulars bringing veteran match temperament.",
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

  console.log("Seeding League (Mpheni Community Pool League)...");
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
    { slug: "elim-blackball-titans", points: 6, played: 3, wins: 2, draws: 0, losses: 1, fw: 12, fl: 7, standing: 2 },
    { slug: "venda-royal-shooters", points: 3, played: 2, wins: 1, draws: 0, losses: 1, fw: 7, fl: 6, standing: 3 },
    { slug: "limpopo-spin-hawks", points: 3, played: 2, wins: 1, draws: 0, losses: 1, fw: 6, fl: 8, standing: 4 },
    { slug: "mpheni-legends-squad", points: 0, played: 2, wins: 0, draws: 0, losses: 2, fw: 2, fl: 10, standing: 5 },
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

  console.log("Seeding Tournament (Mpheni Monthly 8-Ball Invitational)...");
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
      team1Id: dbTeams["venda-royal-shooters"].id,
      team2Id: dbTeams["limpopo-spin-hawks"].id,
      score1: 5,
      score2: 1,
      winnerId: dbTeams["venda-royal-shooters"].captainId,
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
      team2Id: dbTeams["venda-royal-shooters"].id,
      score1: 3,
      score2: 2,
      status: "LIVE",
    },
  });

  console.log("Seeding Matches with Talifhani (Boyka) & Competitors...");
  const talifhani = dbUsers["talifhani_boyka"];
  const lucky = dbUsers["lucky_sniper"];
  const success = dbUsers["success_godfather"];
  const shoni = dbUsers["shoni_problem"];
  const vhutshilo = dbUsers["vhutshilo_gusba"];
  const thabelo = dbUsers["thabelo_caeser"];

  // 1. Live Match: Talifhani (Boyka) vs Lucky Khosa (Sniper)
  const liveMatch = await prisma.match.create({
    data: {
      type: "INDIVIDUAL",
      ruleset: "BLACKBALL_SA",
      raceTo: 5,
      status: "IN_PROGRESS",
      venue: "Mpheni Legends Club - Table 1",
      tableNumber: 1,
      player1Id: talifhani.id,
      player2Id: lucky.id,
      team1Id: dbTeams["mpheni-cue-masters"].id,
      team2Id: dbTeams["venda-royal-shooters"].id,
      scorePlayer1: 3,
      scorePlayer2: 2,
      tournamentId: tournament.id,
      leagueId: mpheniLeague.id,
      startedAt: new Date(Date.now() - 45 * 60 * 1000),
      frames: {
        create: [
          {
            frameNumber: 1,
            winnerId: talifhani.id,
            breakPlayerId: talifhani.id,
            durationSeconds: 210,
            notes: "Boyka breaks and runs out cleanly on reds.",
          },
          {
            frameNumber: 2,
            winnerId: lucky.id,
            breakPlayerId: lucky.id,
            durationSeconds: 290,
            notes: "Lucky Khosa pots 8-ball with long rail cut.",
          },
          {
            frameNumber: 3,
            winnerId: talifhani.id,
            breakPlayerId: talifhani.id,
            durationSeconds: 180,
            notes: "Boyka free shot tactical snooker conversion.",
          },
          {
            frameNumber: 4,
            winnerId: lucky.id,
            breakPlayerId: lucky.id,
            durationSeconds: 320,
            notes: "Lucky capitalizes on cue ball scratch.",
            foulEvent: "FOUL_CUE_SCRATCH",
          },
          {
            frameNumber: 5,
            winnerId: talifhani.id,
            breakPlayerId: talifhani.id,
            durationSeconds: 195,
            notes: "Boyka brilliant bank shot to take 3-2 lead.",
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

  // Update Talifhani & Lucky availability
  await prisma.userAvailability.update({
    where: { userId: talifhani.id },
    data: { status: "IN_MATCH", activeMatchId: liveMatch.id },
  });
  await prisma.userAvailability.update({
    where: { userId: lucky.id },
    data: { status: "IN_MATCH", activeMatchId: liveMatch.id },
  });

  // 2. Match awaiting confirmation: Success (The Godfather) vs Shoni (The Problem)
  const awaitingMatch = await prisma.match.create({
    data: {
      type: "INDIVIDUAL",
      ruleset: "BLACKBALL_SA",
      raceTo: 5,
      status: "AWAITING_CONFIRMATION",
      venue: "Elim Cue Arena - Table 2",
      tableNumber: 2,
      player1Id: success.id,
      player2Id: shoni.id,
      scorePlayer1: 5,
      scorePlayer2: 3,
      winnerId: success.id,
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
          { frameNumber: 1, winnerId: success.id, breakPlayerId: success.id },
          { frameNumber: 2, winnerId: shoni.id, breakPlayerId: shoni.id },
          { frameNumber: 3, winnerId: success.id, breakPlayerId: success.id },
          { frameNumber: 4, winnerId: success.id, breakPlayerId: shoni.id },
          { frameNumber: 5, winnerId: shoni.id, breakPlayerId: success.id },
          { frameNumber: 6, winnerId: shoni.id, breakPlayerId: shoni.id },
          { frameNumber: 7, winnerId: success.id, breakPlayerId: success.id },
          { frameNumber: 8, winnerId: success.id, breakPlayerId: shoni.id },
        ],
      },
    },
  });

  // 3. Completed Historical Match: Talifhani (Boyka) vs Success (The Godfather)
  await prisma.match.create({
    data: {
      type: "INDIVIDUAL",
      ruleset: "BLACKBALL_SA",
      raceTo: 5,
      status: "COMPLETED",
      venue: "Mpheni Legends Club",
      tableNumber: 1,
      player1Id: talifhani.id,
      player2Id: success.id,
      scorePlayer1: 5,
      scorePlayer2: 2,
      winnerId: talifhani.id,
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
            userId: talifhani.id,
            oldRating: 1764,
            newRating: 1780,
            change: 16,
            opponentId: success.id,
            opponentRating: 1676,
          },
          {
            userId: success.id,
            oldRating: 1676,
            newRating: 1660,
            change: -16,
            opponentId: talifhani.id,
            opponentRating: 1764,
          },
        ],
      },
    },
  });

  console.log("Seeding Active Challenge...");
  // Vhutshilo (Gusba) challenged Thabelo (Caeser)
  await prisma.challenge.create({
    data: {
      challengerId: vhutshilo.id,
      challengedId: thabelo.id,
      type: "INDIVIDUAL",
      ruleset: "BLACKBALL_SA",
      raceTo: 5,
      isPlayNow: true,
      venue: "Mpheni Legends Pool Club",
      message: "Ready for our grudge match! First to 5 frames, BSA official rules.",
      status: "PENDING",
      expiresAt: new Date(Date.now() + 2 * 3600 * 1000),
    },
  });

  console.log("Seeding Notifications...");
  await prisma.notification.create({
    data: {
      userId: thabelo.id,
      type: "CHALLENGE_RECEIVED",
      title: "New Challenge from Vhutshilo (Gusba)",
      message: "Vhutshilo challenged you to a Race-to-5 Blackball match at Mpheni Legends.",
      link: "/challenges",
    },
  });

  await prisma.notification.create({
    data: {
      userId: shoni.id,
      type: "RESULT_CONFIRMATION",
      title: "Result Confirmation Required",
      message: "Success (The Godfather) submitted a 5-3 victory in your recent match. Please review and confirm.",
      link: `/matches/${awaitingMatch.id}`,
    },
  });

  console.log("Database seeded successfully with all 13 authentic players and updated tournament brackets!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
