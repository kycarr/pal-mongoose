const mongoose = require("./mongoose");
const shortid = require("shortid");
const Schema = mongoose.Schema;

const DEFAULT_COHORT_MAX_TEAMS_PER_COHORT = 6;
const DEFAULT_COHORT_MAX_MEMBERS_PER_TEAM = 5;
const DEFAULT_SORT_USERS_ONTO_TEAMS = require("./utils/sort-users-onto-teams");
const DEFAULT_COHORT_TEAMS = [
  {
    name: "Minnows",
    icon: "LogoTeamRazorfish",
    inviteCode: shortid.generate()
  },
  {
    name: "WaveMakers",
    icon: "LogoTeamZephyr",
    inviteCode: shortid.generate()
  },
  {
    name: "Hurricane",
    icon: "LogoTeamSquall",
    inviteCode: shortid.generate()
  },
  {
    name: "ShipsAhoy",
    icon: "LogoTeamLighthouse",
    inviteCode: shortid.generate()
  },
  {
    name: "RedSquad",
    icon: "LogoTeamGladiator",
    inviteCode: shortid.generate()
  },
  {
    name: "ElectricForce",
    icon: "LogoTeamFirebolt",
    inviteCode: shortid.generate()
  }
];

mongoose.set("useFindAndModify", false); // https://github.com/Automattic/mongoose/issues/6922#issue-354147871

const GoalCohortTeam = new Schema({
  name: { type: String, required: "{PATH} is required!" },
  icon: { type: String, required: "{PATH} is required!" },
  inviteCode: { type: String, required: "{PATH} is required!" }
});

GoalCohortTeam.plugin(require("./plugins/mongoose-no-underscore-id"));

const GoalCohortMember = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: "{PATH} is required!",
    index: true
  },
  teamIndex: {
    // rather that use a team ref, use index.
    // Allows for more-atomic updates
    // and more graceful cleanups in a non-transactional env
    type: Number,
    required: "{PATH} is required!",
    default: 0
  }
});

GoalCohortMember.plugin(require("./plugins/mongoose-no-underscore-id"));

const GoalCohort = new Schema(
  {
    goal: {
      type: Schema.Types.ObjectId,
      ref: "Goal",
      required: "{PATH} is required!",
      index: true
    },
    teams: [GoalCohortTeam],
    membersMax: { type: Number, default: 30 },
    memberSlotsRemaning: {
      // memberSlotsRemaning creates an anomoly w members.Count and membersMax
      // but necessary for efficiently finding a GoalCohort
      // that can accept new members
      type: Number,
      default: 0,
      required: "{PATH} is required!",
      index: true
    },
    members: [GoalCohortMember]
  },
  { timestamps: true }
);

GoalCohort.plugin(require("./plugins/mongoose-find-one-by-id-or-alias"));
GoalCohort.plugin(require("./plugins/mongoose-no-underscore-id"));
GoalCohort.plugin(require("./plugins/mongoose-to-id"));
GoalCohort.plugin(require("mongoose-findorcreate"));

/**
 * Finds the GoalCohort for a user in one of the following ways:
 * 1) If the user already belongs to a cohort for the given goal, returns that GoalCohort
 */
GoalCohort.statics.findUserCohort = async function(user, goal) {
  const goalCohortModel = this;

  return await goalCohortModel.findOne({
    goal: goal.id,
    members: {
      $elemMatch: {
        user: user.id
      }
    }
  });
};

/**
 * Finds the GoalCohort for a user in one of the following ways:
 *
 * 1) If the user already belongs to a cohort for the given goal, return it
 * 2) If there is an existing cohort for the goal that can accept additional members,
 *		adds the user to that cohort and returns it
 * 3) If neither of the above, creates a new GoalCohort
 *		and adds the user as its first member
 */
GoalCohort.statics.joinOrCreateCohort = async function(user, goal, opts) {
  const goalCohortModel = this;

  let cohort = await goalCohortModel.findOne({
    goal: goal.id,
    members: {
      $elemMatch: {
        user: user.id
      }
    }
  });

  // If the user already belongs to a cohort for the given goal, return it
  if (cohort) {
    return cohort;
  }

  opts = opts || {};
  const newCohortTeams = opts.new_cohort_teams || DEFAULT_COHORT_TEAMS;
  const newCohortMaxMembersPerTeam =
    opts.new_cohort_max_members_per_team || DEFAULT_COHORT_MAX_MEMBERS_PER_TEAM;
  const newCohortMaxMembers =
    newCohortMaxMembersPerTeam * newCohortTeams.length;

  cohort = await goalCohortModel.findOneAndUpdate(
    {
      goal: goal.id,
      memberSlotsRemaning: { $gt: 0 }
    },
    {
      // if finds a cohort w space, push the user into team 0
      // repair them to a new team in subsequent update
      $push: {
        members: {
          user: user.id,
          teamIndex: 0
        }
      },
      $inc: {
        memberSlotsRemaning: -1
      },
      $setOnInsert: {
        // if new cohort, create a team and put the user on it
        goal: goal.id,
        teams: newCohortTeams,
        membersMax: newCohortMaxMembers
      }
    },
    {
      new: true, // return the updated doc rather than pre update
      upsert: true // insert if no cohort found
    }
  );

  // We're in the case of having a newly created cohort
  // All we have to do is repair memberSlotsRemaning
  if (cohort.memberSlotsRemaning === -1) {
    return await goalCohortModel.findByIdAndUpdate(
      cohort.id,
      {
        $set: {
          memberSlotsRemaning: newCohortMaxMembers - 1
        }
      },
      {
        new: true // return the updated doc rather than pre update
      }
    );
  }

  // We're in the case where we added the user to an existing GoalCohort
  // They were added to teamIndex 0; we need to put them on a proper team

  const sortUsersOntoTeams =
    opts.sort_users_onto_teams || DEFAULT_SORT_USERS_ONTO_TEAMS;

  const membersSorted = sortUsersOntoTeams(cohort.members);

  // find all the members whose team has changed
  // add an update for each in the syntax of mongo's $set operator
  // will look like this:
  // { 'members.5.teamIndex': 1, 'members.11.teamIndex':2 }
  const changesAsSet = membersSorted.reduce((acc, cur, i) => {
    if (cohort.members[i].teamIndex === membersSorted[i].teamIndex) {
      // ignore members whose team hasn't changed
      return acc;
    }

    acc[`members.${i}.teamIndex`] = membersSorted[i].teamIndex;

    return acc;
  }, {});

  return await goalCohortModel.findByIdAndUpdate(
    cohort.id,
    {
      $set: changesAsSet
    },
    {
      new: true // return the updated doc rather than pre update
    }
  );
};

GoalCohort.statics.joinCohort = async function(user, goal, code) {
  const goalCohortModel = this;

  let cohort = await goalCohortModel.findOne({
    goal: goal.id,
    members: {
      $elemMatch: {
        user: user.id
      }
    }
  });

  if (cohort) {
    const _user = cohort.members.find(m => m.user.equals(user.id));
    const _team = cohort.teams[_user.teamIndex];

    // if user is already in the correct team, return it
    if (_team.inviteCode === code) {
      return cohort;
    }

    // if user is in a different team, leave the current team
    if (_team.inviteCode !== code) {
      cohort = await goalCohortModel.leaveCohort(user, goal);
    }
  }

  cohort = await goalCohortModel.findOne({
    goal: goal.id,
    teams: {
      $elemMatch: {
        inviteCode: code
      }
    }
  });

  if (!cohort) {
    const err = new Error(`failed to find team with invite code`);
    err.status = 404;
    throw err;
  }

  const teamIdx = cohort.teams.findIndex(t => t.inviteCode === code);

  return await goalCohortModel.findOneAndUpdate(
    {
      _id: cohort._id,
      memberSlotsRemaning: { $gt: 0 }
    },
    {
      $push: {
        members: {
          user: user.id,
          teamIndex: teamIdx
        }
      },
      $inc: {
        memberSlotsRemaning: -1
      }
    },
    {
      new: true, // return the updated doc rather than pre update
      upsert: true // insert if no cohort found
    }
  );
};

GoalCohort.statics.createTeam = async function(user, goal, teamname) {
  const goalCohortModel = this;

  let cohort = await goalCohortModel.findUserCohort(user, goal);

  // if user is already in a cohort, leave it
  if (cohort) {
    cohort = await goalCohortModel.leaveCohort(user, goal);
  }

  cohort = await goalCohortModel.findOne({
    goal: goal.id,
    membersMax: {
      $lt:
        DEFAULT_COHORT_MAX_MEMBERS_PER_TEAM *
        DEFAULT_COHORT_MAX_TEAMS_PER_COHORT
    },
    memberSlotsRemaning: { $gt: 0 }
  });

  let teamIndex = 0;
  let teamIcon = "LogoTeamRazorfish";

  if (cohort) {
    teamIndex = cohort.teams.length;
    teamIcon = DEFAULT_COHORT_TEAMS[cohort.teams.length].icon;
  }

  return await goalCohortModel.findOneAndUpdate(
    {
      goal: goal.id,
      membersMax: {
        $lt:
          DEFAULT_COHORT_MAX_MEMBERS_PER_TEAM *
          DEFAULT_COHORT_MAX_TEAMS_PER_COHORT
      },
      memberSlotsRemaning: { $gt: 0 }
    },
    {
      $push: {
        members: {
          user: user.id,
          teamIndex: teamIndex
        },
        teams: {
          name: teamname,
          icon: teamIcon,
          inviteCode: shortid.generate()
        }
      },
      $inc: {
        memberSlotsRemaning: DEFAULT_COHORT_MAX_MEMBERS_PER_TEAM - 1,
        membersMax: DEFAULT_COHORT_MAX_MEMBERS_PER_TEAM
      },
      $setOnInsert: {
        goal: goal.id
      }
    },
    {
      new: true, // return the updated doc rather than pre update
      upsert: true // insert if no cohort found
    }
  );
};

GoalCohort.statics.leaveCohort = async function(user, goal) {
  const goalCohortModel = this;

  const cohort = await goalCohortModel.findUserCohort(user, goal);
  if (!cohort) {
    const err = new Error(`user is not in a cohort`);
    err.status = 404;
    throw err;
  }

  return await goalCohortModel.findOneAndUpdate(
    {
      _id: cohort.id
    },
    {
      $pull: {
        members: {
          user: user.id
        }
      },
      $inc: {
        memberSlotsRemaning: 1
      }
    },
    {
      new: true // return the updated doc rather than pre update
    }
  );
};

GoalCohort.statics.invite = async function(user, goal) {
  const goalCohortModel = this;

  const cohort = await goalCohortModel.findOne({
    goal: goal.id,
    members: {
      $elemMatch: {
        user: user.id
      }
    }
  });

  if (!cohort) {
    const err = new Error("user is not in a cohort");
    err.status = 404;
    throw err;
  }

  const teams = cohort.teams.map((team, i) => {
    if (!team.inviteCode) {
      return { ...team, inviteCode: shortid.generate() };
    }
    return team;
  });

  const changesAsSet = teams.reduce((acc, cur, i) => {
    if (cohort.teams[i].inviteCode === teams[i].inviteCode) {
      return acc;
    }
    acc[`teams.${i}.inviteCode`] = teams[i].inviteCode;
    return acc;
  }, {});

  return await goalCohortModel.findByIdAndUpdate(
    cohort.id,
    {
      $set: changesAsSet
    },
    {
      new: true
    }
  );
};

GoalCohort.statics.kickMember = async function(user, goal, memberId) {
  const goalCohortModel = this;

  const cohort = await goalCohortModel.findUserCohort(user, goal);
  if (!cohort) {
    const err = new Error(`user is not in a cohort`);
    err.status = 404;
    throw err;
  }

  const member = cohort.members.find(m => m.user.equals(memberId));
  if (!member) {
    const err = new Error(`member is not in user's cohort`);
    err.status = 404;
    throw err;
  }

  const memberTeam = member.teamIndex;
  const userTeam = cohort.members.find(m => m.user.equals(user.id)).teamIndex;

  if (memberTeam != userTeam) {
    const err = new Error(`member is not in user's team`);
    err.status = 404;
    throw err;
  }

  return await goalCohortModel.findOneAndUpdate(
    {
      _id: cohort.id
    },
    {
      $pull: {
        members: {
          user: memberId
        }
      },
      $inc: {
        memberSlotsRemaning: 1
      }
    },
    {
      new: true // return the updated doc rather than pre update
    }
  );
};

module.exports = mongoose.model("GoalCohort", GoalCohort);
