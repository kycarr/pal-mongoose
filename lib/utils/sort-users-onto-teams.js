const MAX_TEAM_SIZE_DEFAULT = 5;

const teamAssignmentsTable = [
  0,
  0,
  1,
  1,
  2,
  2,
  0, // user 7, start teams of 3
  1,
  2,
  0, // user 10, start teams of 4
  1,
  2,
  3,
  0,
  1,
  2,
  3,
  0,
  1,
  2,
  3,
  0,
  1,
  2,
  3,
  0, // user 26 start teams of 5
  1,
  2,
  3,
  4, //user 30
  0,
  1,
  2,
  3,
  4, //user 35
  0,
  1,
  2,
  3,
  4, // user 40
  0,
  1,
  2,
  3,
  4, // user 45
  0,
  1,
  2,
  3,
  4, // user 50
];

/**
 * Sort a group of users onto teams.
 * This impl assumes users are never being removed from a team.
 * If requirements change to include support for removing users
 * from teams, will need to update this to NOT reassign users who already have a team.
 */
const sortUsersOntoTeams = (teamMembers, maxTeamSize) => {
  const n = teamMembers.length;

  maxTeamSize = !isNaN(Number(maxTeamSize))
    ? Number(maxTeamSize)
    : MAX_TEAM_SIZE_DEFAULT;

  return teamMembers.map((m, i) => {
    if (i < teamAssignmentsTable.length) {
      return { ...m, teamIndex: teamAssignmentsTable[i] };
    }

    return {
      ...m,
      teamIndex:
        (i -
          Math.floor(teamAssignmentsTable.length / maxTeamSize) +
          (teamAssignmentsTable.length % maxTeamSize)) %
        maxTeamSize,
    };
  });
};

module.exports = sortUsersOntoTeams;
