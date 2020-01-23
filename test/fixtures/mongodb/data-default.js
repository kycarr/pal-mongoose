const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;
module.exports = {
  goals: [
    {
      _id: ObjectId("5b5a2cd69b1fafcf999d957e"),
      name: "Advancement Test - FC E3",
      alias: "advancement-test-fc-e3",
      desc:
        "Advancement tests are particularly important reaching E3 and E4 ratings. Study electronics skills, leadership, and general navy information to ace your test.",
      focusList: [
        {
          name: "Technical Skills",
          desc:
            "Fundamental and applied electronics, such as understanding components and diagnosing faults.",
          _id: "technical-skills",
          topics: [
            "diode-action",
            "zener-diode-action",
            "rlc-circuits-and-filters",
            "half-and-full-wave-rectifiers",
            "regulators-and-smoothing",
            "transistor-biasing"
          ]
        },
        {
          name: "Navy Life",
          desc:
            "Navy culture and requirements, such as ship types, rates, symbols, and acronyms.",
          _id: "navy-life",
          topics: []
        },
        {
          name: "Leadership",
          desc:
            "Skills required for petty officers, such as dealing with performance problems or conflict in a team.",
          _id: "leadership",
          topics: []
        }
      ]
    },
    {
      _id: ObjectId("5bb6540cbecb4e208da0fb65"),
      name: "College Preparation",
      alias: "college-preparation",
      desc:
        "Study Math, English, and writing skills required for admission and success in a competitive degree program. Review pros and cons for colleges and university options.",
      focusList: [
        {
          name: "Algebra 1",
          desc: "Symbolic math, such as single variable equations.",
          _id: "algebra-1",
          topics: ["polynomials-intro"]
        }
      ]
    },
    {
      _id: ObjectId("5bb6540cbecb4e208da0fb64"),
      name: "Health and Wellness",
      alias: "health-and-wellness",
      desc:
        "Improve your academic and job performance through skills sleep management, exercise skills, and eating habits.",
      focusList: [
        {
          name: "Sleep Disturbances",
          desc: "Skills and tips about how to sleep better.",
          _id: "sleep-disturbances",
          topics: ["sleep-habits-101"]
        }
      ]
    }
  ],

  topics: [
    {
      _id: ObjectId("5ba2ef369b1fafcf999a95dc"),
      name: "Diode Action",
      alias: "diode-action",
      recommender: null
    },
    {
      _id: ObjectId("5bb6540bbecb4e208da0f6ec"),
      name: "Polynomials Intro",
      alias: "polynomials-intro",
      recommender: null
    }
  ],

  lessons: [
    {
      _id: ObjectId("5b5a2cd69b1fafcf999d932e"),
      name: "Review Diode Current Flow",
      alias: "diode-action-review-diode-current-flow",
      desc: "The direction that current flows in a diode",
      type: "testing",
      displayType: "auto-tutor",
      ord: 2,
      estMinLow: 1,
      estMinHigh: 2,
      downloadable: true,
      deleted: false,
      topic: ObjectId("5ba2ef369b1fafcf999a95dc")
    },
    {
      _id: ObjectId("5bb6540cbecb4e208da0fa6d"),
      name: "Polynomials Overview",
      alias: "polynomials-intro-polynomials-overview",
      desc: "",
      type: "testing",
      displayType: "web",
      ord: 0,
      estMinLow: 1,
      estMinHigh: 2,
      downloadable: null,
      deleted: false,
      topic: ObjectId("5bb6540bbecb4e208da0f6ec")
    }
  ],

  resources: [
    {
      _id: ObjectId("5cffef5ebecb4e208d44eb41"),
      explorationLevel: 0.5,
      duration: 10,
      alias: "inots-pushing-the-line",
      createdAt: "2019-06-11T18:13:49.628Z",
      isCmiAU: true,
      knowledgeComponents: [
        { relevance: 1, kc: "5cffef5dbecb4e208d44ea1e" },
        { relevance: 1, kc: "5cffef5dbecb4e208d44ea0d" },
        { relevance: 1, kc: "5cffef5dbecb4e208d44ea0a" },
        { relevance: 1, kc: "5cffef5dbecb4e208d44ea10" },
        { relevance: 1, kc: "5cffef5dbecb4e208d44ea31" },
        { relevance: 1, kc: "5cffef5dbecb4e208d44ea0e" }
      ],
      type: "web-active",
      updatedAt: "2019-11-27T18:40:48.771Z",
      uri: "https://dev.inots.org/8/?noheader=true",
      assets: [],
      _id: ObjectId("5cffef5ebecb4e208d44eb41")
    },
    {
      _id: ObjectId("5b5a2cd69b1fafcf999d9222"),
      explorationLevel: 0,
      duration: 60,
      alias: "Polynomials Overview",
      knowledgeComponents: [{ relevance: 1, kc: "polynomials" }],
      type: "web-passive",
      uri:
        "https://www.khanacademy.org/math/algebra/introduction-to-polynomial-expressions/introduction-to-polynomials/v/polynomials-intro",
      assets: []
    }
  ],

  users: [
    {
      _id: ObjectId("5dd88892c012321c14267155"),
      name: "kcarr",
      nameLower: "kcarr",
      email: "kcarr@ict.usc.edu",
      password: "$2a$10$RigOzUVHdGIpqsObXel8bu9psmyWKgHCXLhmflZy6qyKN0tYsCKam"
    },
    {
      _id: ObjectId("5dd88892c012321c14267156"),
      name: "larry",
      nameLower: "larry",
      email: "kirschner@ict.usc.edu",
      password: "$2a$10$RigOzUVHdGIpqsObXel8bu9psmyWKgHCXLhmflZy6qyKN0tYsCKam"
    },
    {
      _id: ObjectId("5bf4a366becb4e208de99092"),
      name: "Expert",
      nameLower: "expert",
      email: "expert@pal.ict.usc.edu",
      password: "acceptsanything"
    },
    {
      _id: ObjectId("5bf4a366becb4e208de99099"),
      name: "DeletedUser",
      nameLower: "deleteduser",
      email: "deleteduser@pal.ict.usc.edu",
      password: "acceptsanything",
      deleted: true
    }
  ],

  useraccesstokens: [
    {
      _id: ObjectId("5bf4a366becb4e208de99091"),
      accessToken: "82189440-16fc-11ea-996e-321c14267155",
      resetPasswordToken: "resetpasswordtoken",
      resetPasswordExpires: new Date("3000-05-14T11:01:58.135Z"),
      user: ObjectId("5dd88892c012321c14267155")
    },
    {
      _id: ObjectId("5bf4a366becb4e208de99093"),
      accessToken: "82189440-16fc-11ea-996e-321c14267156",
      resetPasswordToken: "token",
      resetPasswordExpires: new Date("3000-05-14T11:01:58.135Z"),
      user: ObjectId("5dd88892c012321c14267156")
    },
    {
      _id: ObjectId("5df9570b3440520012cd80ac"),
      accessToken: "2f8ee6a0-ed24-11e8-a8a9-4e208de99092",
      resetPasswordToken: "expiredtoken",
      resetPasswordExpires: new Date("2000-05-14T11:01:58.135Z"),
      user: ObjectId("5bf4a366becb4e208de99092")
    }
  ],

  goalcohorts: [
    {
      _id: ObjectId("5d9dfde2becb4e208d59dc4d"),
      goal: ObjectId("5b5a2cd69b1fafcf999d957e"),
      membersMax: 30,
      memberSlotsRemaning: 27,
      members: [
        {
          teamIndex: 0,
          user: ObjectId("5dd88892c012321c14267155"),
          id: ObjectId("5d9dfde2ec2b930013f84dd0")
        },
        {
          teamIndex: 0,
          user: ObjectId("5dd88892c012321c14267156"),
          id: ObjectId("5d9dfde2ec2b930013f84dd2")
        },
        {
          teamIndex: 1,
          user: ObjectId("5bf4a366becb4e208de99092"),
          id: ObjectId("5d9e30b8ec2b930013f84ded")
        }
      ],
      teams: [
        {
          id: ObjectId("5d9dfde2ec2b930013f84dcf"),
          name: "Minnows",
          icon: "LogoTeamRazorfish"
        },
        {
          id: ObjectId("5d9dfde2ec2b930013f84dce"),
          name: "WaveMakers",
          icon: "LogoTeamZephyr",
          inviteCode: "lTQ2Uf_LJ"
        }
      ]
    },
    {
      _id: ObjectId("5d9dfde2becb4e278d59dc4d"),
      goal: ObjectId("5b5a2cd69b1fafcf999d957e"),
      membersMax: 30,
      memberSlotsRemaning: 30,
      members: [],
      teams: [
        {
          id: ObjectId("5d9dfde2ec2b930013f84dcf"),
          name: "Minnows",
          icon: "LogoTeamRazorfish"
        },
        {
          id: ObjectId("5d9dfde2ec2b930013f84dce"),
          name: "WaveMakers",
          icon: "LogoTeamZephyr",
          inviteCode: "rPT4wj_QT"
        }
      ]
    },
    {
      _id: ObjectId("5df95a108878787d7708ec53"),
      goal: ObjectId("5bb6540cbecb4e208da0fb65"),
      membersMax: 10,
      memberSlotsRemaning: 10,
      members: [],
      teams: [
        {
          id: ObjectId("5df95a103440520012cd80b1"),
          name: "RedSquad",
          icon: "LogoTeamGladiator",
          inviteCode: "lUYoW3tLo"
        },
        {
          id: ObjectId("5df95a103440520012cd80b0"),
          name: "ShipsAhoy",
          icon: "LogoTeamLighthouse",
          inviteCode: "lTQ2Uf_LJ"
        }
      ]
    },
    {
      _id: ObjectId("5df95a108878787d7708ec54"),
      goal: ObjectId("5bb6540cbecb4e208da0fb64"),
      membersMax: 30,
      memberSlotsRemaning: 0,
      members: [],
      teams: [
        {
          name: "Minnows",
          icon: "LogoTeamRazorfish"
        },
        {
          name: "WaveMakers",
          icon: "LogoTeamZephyr"
        },
        {
          name: "Hurricane",
          icon: "LogoTeamSquall"
        },
        {
          name: "ShipsAhoy",
          icon: "LogoTeamLighthouse"
        },
        {
          name: "RedSquad",
          icon: "LogoTeamGladiator"
        },
        {
          name: "ElectricForce",
          icon: "LogoTeamFirebolt"
        }
      ]
    }
  ]
};
