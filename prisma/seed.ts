import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌋 Starting to seed the database with fellowship data...");

  // Hash password for all users
  const hashedPassword = await bcrypt.hash("password123", 10);

  // Create Users (The Fellowship)
  const frodo = await prisma.user.create({
    data: {
      email: "frodo.baggins@theshire.me",
      name: "Frodo Baggins",
      password: hashedPassword,
    },
  });

  const sam = await prisma.user.create({
    data: {
      email: "samwise.gamgee@theshire.me",
      name: "Samwise Gamgee",
      password: hashedPassword,
    },
  });

  const merry = await prisma.user.create({
    data: {
      email: "merry.brandybuck@theshire.me",
      name: "Meriadoc Brandybuck",
      password: hashedPassword,
    },
  });

  const pippin = await prisma.user.create({
    data: {
      email: "pippin.took@theshire.me",
      name: "Peregrin Took",
      password: hashedPassword,
    },
  });

  console.log("✅ Created 4 fellowship members");

  // Create Projects
  const gondorProject = await prisma.project.create({
    data: {
      name: "Support Gondor's Post-War Renovation Initiative",
      description:
        "Grassroots campaign to gather support for rebuilding Minas Tirith and restoring the White City to its former glory. We need citizen signatures!",
      ownerId: frodo.id,
    },
  });

  const rivendellProject = await prisma.project.create({
    data: {
      name: "Petition Elves to Deal with Rivendell Orc Infestation",
      description:
        "Urgent petition to get Lord Elrond's attention on the growing orc problem near the Last Homely House. Collecting signatures from concerned citizens.",
      ownerId: sam.id,
    },
  });

  const shireProject = await prisma.project.create({
    data: {
      name: "Save the Shire's Old Forest Campaign",
      description:
        "Community organizing to prevent Saruman's industrial expansion into the Old Forest. Protect our hobbit heritage!",
      ownerId: merry.id,
    },
  });

  const pipeweedProject = await prisma.project.create({
    data: {
      name: "Longbottom Leaf Fair Trade Certification Drive",
      description:
        "Campaign to ensure all pipe-weed growers receive fair compensation and working conditions. Quality smoke for all!",
      ownerId: pippin.id,
    },
  });

  console.log("✅ Created 4 canvassing projects");

  // Add project members (collaborative projects)
  await prisma.projectMember.createMany({
    data: [
      // Gondor project - Frodo (owner) + Sam
      { userId: frodo.id, projectId: gondorProject.id, role: "owner" },
      { userId: sam.id, projectId: gondorProject.id, role: "member" },

      // Rivendell project - Sam (owner) + Frodo + Merry
      { userId: sam.id, projectId: rivendellProject.id, role: "owner" },
      { userId: frodo.id, projectId: rivendellProject.id, role: "member" },
      { userId: merry.id, projectId: rivendellProject.id, role: "member" },

      // Shire Forest - Merry (owner) + Pippin
      { userId: merry.id, projectId: shireProject.id, role: "owner" },
      { userId: pippin.id, projectId: shireProject.id, role: "member" },

      // Pipeweed - Pippin (owner) + all hobbits
      { userId: pippin.id, projectId: pipeweedProject.id, role: "owner" },
      { userId: frodo.id, projectId: pipeweedProject.id, role: "member" },
      { userId: sam.id, projectId: pipeweedProject.id, role: "member" },
      { userId: merry.id, projectId: pipeweedProject.id, role: "member" },
    ],
  });

  console.log("✅ Added project members");

  // Create Canvassing Notes - Gondor Project
  await prisma.canvassingNote.createMany({
    data: [
      {
        projectId: gondorProject.id,
        userId: frodo.id,
        contactName: "Aragorn son of Arathorn",
        contactEmail: "king.elessar@gondor.gov",
        notes:
          "Spoke with the King himself! He's very supportive of the renovation initiative and offered to match citizen donations up to 10,000 gold pieces. He emphasized the importance of restoring the Tower of Ecthelion. Wants to schedule a follow-up meeting next week. VERY ENTHUSIASTIC - marked as strong supporter!",
        createdAt: new Date("2025-01-10T10:30:00"),
      },
      {
        projectId: gondorProject.id,
        userId: sam.id,
        contactName: "Faramir of Gondor",
        contactEmail: "faramir.steward@gondor.gov",
        notes:
          "Met with the Steward at the Houses of Healing. He's concerned about the timeline but agrees the city needs restoration. Suggested focusing on the lower levels first where most citizens live. Will bring proposal to the Council next month. Asked for detailed budget breakdown.",
        createdAt: new Date("2025-01-11T14:15:00"),
      },
      {
        projectId: gondorProject.id,
        userId: frodo.id,
        contactName: "Éowyn of Rohan",
        contactEmail: "eowyn.shieldmaiden@rohan.org",
        notes:
          "The Lady of Ithilien is fully on board! She's already organizing Rohirrim volunteers to help with stonework. Mentioned her experience rebuilding after the war. Wants to coordinate with Faramir on project management. She's a natural leader - consider for campaign committee!",
        createdAt: new Date("2025-01-12T09:45:00"),
      },
      {
        projectId: gondorProject.id,
        userId: sam.id,
        contactName: "Beregond of the Citadel Guard",
        contactEmail: null,
        notes:
          "Tower guard, very practical fellow. Concerned about security during renovations - doesn't want scaffolding to create vulnerabilities. Suggested phased approach. Will sign petition if security plan is included. Reminded me that Minas Tirith has been standing for thousands of years, we shouldn't rush and compromise its defenses.",
        createdAt: new Date("2025-01-13T16:20:00"),
      },
    ],
  });

  // Rivendell Orc Problem
  await prisma.canvassingNote.createMany({
    data: [
      {
        projectId: rivendellProject.id,
        userId: sam.id,
        contactName: "Lord Elrond Half-elven",
        contactEmail: "elrond@rivendell.org",
        notes:
          "The Lord of Rivendell listened patiently but seems hesitant to take immediate action. Says the orc sightings are 'concerning but not unprecedented' and that Rivendell's defenses are still strong. Mentioned he's preparing to sail West soon. Needs more citizen pressure to prioritize this! Follow-up needed.",
        createdAt: new Date("2025-01-09T11:00:00"),
      },
      {
        projectId: rivendellProject.id,
        userId: frodo.id,
        contactName: "Arwen Undómiel",
        contactEmail: "arwen.evenstar@rivendell.org",
        notes:
          "Queen of Gondor now, but still cares deeply about Rivendell's safety. She's willing to speak to Aragorn about sending rangers to investigate. Very diplomatic - suggested framing it as 'routine patrol expansion' rather than emergency response. Smart political thinking! She'll attend our rally next month.",
        createdAt: new Date("2025-01-10T15:30:00"),
      },
      {
        projectId: rivendellProject.id,
        userId: merry.id,
        contactName: "Glorfindel of the House of the Golden Flower",
        contactEmail: null,
        notes:
          "Legendary elf-lord, bit intimidating! He's actually VERY concerned about the orcs and has been tracking their movements. Says there's a small band of stragglers from Mordor, leaderless but still dangerous. Offered to lead a small company to clear them out if Lord Elrond gives the word. This could be our breakthrough! Get more signatures to give Elrond political cover.",
        createdAt: new Date("2025-01-14T08:00:00"),
      },
    ],
  });

  // Shire Forest Campaign
  await prisma.canvassingNote.createMany({
    data: [
      {
        projectId: shireProject.id,
        userId: merry.id,
        contactName: "Tom Bombadil",
        contactEmail: null,
        notes:
          "Met Old Tom by the Withywindle! Absolutely delighted by our campaign. He sang a song about it (didn't quite catch all the words). Says the Old Forest has been there since before the hobbits and should stay that way. Can't get him to sign anything official - he doesn't really do paperwork - but he promised to 'have a word' with the trees. Whatever that means, it seemed positive!",
        createdAt: new Date("2025-01-08T13:20:00"),
      },
      {
        projectId: shireProject.id,
        userId: pippin.id,
        contactName: "Farmer Maggot",
        contactEmail: "maggot.farms@eastfarthing.sh",
        notes:
          "Farmer Maggot is FURIOUS about the industrial plans. His mushroom crops depend on the Old Forest's ecosystem. He's rallying all the East Farthing farmers and promises to bring 50+ signatures by week's end. Also threatened to set his dogs on anyone from Saruman's company who comes around. Very passionate ally!",
        createdAt: new Date("2025-01-11T10:15:00"),
      },
      {
        projectId: shireProject.id,
        userId: merry.id,
        contactName: "Fredegar Bolger",
        contactEmail: "fatty.bolger@theshire.me",
        notes:
          "Fatty's on board but nervous about confrontation. He'll sign the petition and encourage his family, but doesn't want to be at any protests. That's fine - we need quiet supporters too! He mentioned his cousin has connections to the Thain's office, might be useful later.",
        createdAt: new Date("2025-01-15T14:45:00"),
      },
    ],
  });

  // Pipeweed Fair Trade
  await prisma.canvassingNote.createMany({
    data: [
      {
        projectId: pipeweedProject.id,
        userId: pippin.id,
        contactName: "Tobold Hornblower",
        contactEmail: null,
        notes:
          "The legendary pipeweed grower! At 90 years old, he's seen the industry change a lot. Very supportive of fair trade certification - says the big distributors have been squeezing small farmers for years. Offered to be a spokesperson for the campaign. His endorsement will carry a lot of weight in Longbottom!",
        createdAt: new Date("2025-01-07T11:30:00"),
      },
      {
        projectId: pipeweedProject.id,
        userId: frodo.id,
        contactName: "Gandalf the White",
        contactEmail: "gandalf.greyhame@istari.org",
        notes:
          "The wizard was passing through and I caught him at the Green Dragon. He laughed heartily at our campaign and said 'finally, hobbits organizing for something beyond second breakfast!' Very encouraging. He smokes Longbottom Leaf himself and thinks quality should be preserved. Can't officially endorse (wizard neutrality), but he'll spread word in his travels.",
        createdAt: new Date("2025-01-09T19:00:00"),
      },
      {
        projectId: pipeweedProject.id,
        userId: sam.id,
        contactName: "Rosie Cotton",
        contactEmail: "rose.cotton@theshire.me",
        notes:
          "My dear Rosie is fully supportive! Her family has connections to several growers in the Southfarthing. She's organizing a women's auxiliary committee to support the campaign - they'll handle outreach to families and local inns. She's also making seed cakes for our next rally. Best wife a hobbit could ask for!",
        createdAt: new Date("2025-01-12T17:30:00"),
      },
      {
        projectId: pipeweedProject.id,
        userId: merry.id,
        contactName: "Barliman Butterbur",
        contactEmail: "innkeeper@prancingpony.bree",
        notes:
          "The Prancing Pony's keeper is interested but cautious. He buys a lot of pipeweed for his patrons and doesn't want prices to go up too much. Fair point. Explained that fair trade doesn't necessarily mean higher costs, just better distribution of profits. He's thinking it over. Need to send him economic analysis.",
        createdAt: new Date("2025-01-13T12:00:00"),
      },
    ],
  });

  console.log("✅ Created canvassing notes for all projects");

  console.log("\n🎉 Database seeded successfully!");
  console.log("\n📊 Summary:");
  console.log("   - 4 Users (Frodo, Sam, Merry, Pippin)");
  console.log("   - 4 Projects (Gondor, Rivendell, Shire Forest, Pipeweed)");
  console.log("   - 14 Canvassing notes with LOTR characters");
  console.log("\n🔐 All users have password: password123");
  console.log("\n✨ May the light of Eärendil guide your canvassing efforts!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
