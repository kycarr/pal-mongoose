import * as mongoose from "mongoose";
// TODO: make the pal-mongoose module export types, until then just fill in here as needed
declare module "pal-mongoose" {
  export class AppVersions extends mongoose.Model {
    platform: string;
    appId: boolean;
    appUpdateUrl: boolean;
    versionMin: string;
    versionLatest: string;
    versions: { version: string; notes: string }[];
  }

  export class Career extends mongoose.Model {
    alias: string;
    defaultSuggested: boolean;
    deleted: boolean;
    desc: string;
    name: string;
    ord: number;
    suggestedGoals: mongoose.Types.ObjectId[];

    static findSuggested: () => Promise<Career>;
  }

  export class DemoUser extends mongoose.Model {
    goal: mongoose.Types.ObjectId;
    focus: mongoose.Types.ObjectId;
    topic: mongoose.Types.ObjectId;
  }

  export interface Focus {
    desc: string;
    name: string;
    topics: mongoose.Types.ObjectId[];
  }

  export class Goal extends mongoose.Model {
    alias: string;
    desc: string;
    focusList: [Focus];
    name: string;

    findAllKnowledgeComponents: () => { [kc: string]: string };
    findFocusByIdOrAlias: (idOrAlias: string) => Focus | null;
    findUniqueTopicIds: () => mongoose.Types.ObjectId[];
  }

  export interface GoalCohortTeam {
    icon: string;
    inviteCode: string;
    name: string;
  }

  export interface GoalCohortMember {
    user: mongoose.Types.ObjectId;
    teamIndex: number;
  }

  export class GoalCohort extends mongoose.Model {
    goal: mongoose.Types.ObjectId;
    members: GoalCohortMember[];
    membersMax: number;
    memberSlotsRemaning: number;
    teams: GoalCohortTeam[];

    static createTeam: (
      user: User,
      goal: Goal,
      teamName: string
    ) => Promise<GoalCohort>;

    static findUserCohort: (user: User, goal: Goal) => Promise<GoalCohort>;

    static invite: (
      user: User,
      goal: Goal,
      teamName: string
    ) => Promise<GoalCohort>;

    static joinCohort: (
      user: User,
      goal: Goal,
      code: string
    ) => Promise<GoalCohort>;

    static joinOrCreateCohort: (
      user: User,
      goal: Goal,
      opts: {
        new_cohort_teams: any;
        new_cohort_max_members_per_team: number;
        sort_users_onto_teams: () => {};
      }
    ) => Promise<GoalCohort>;

    static kickMember: (
      user: User,
      goal: Goal,
      memberId: mongoose.Types.ObjectId
    ) => Promise<GoalCohort>;

    static leaveCohort: (user: User, goal: Goal) => Promise<GoalCohort>;
  }

  export interface KnowledgeComponentRelevance {
    kc: mongoose.Types.ObjectId;
    relevance: number;
  }

  export class KnowledgeComponent extends mongoose.Model {
    alias: string;
    desc: string;
    name: string;
  }

  export class Lesson extends mongoose.Model {
    alias: string;
    deleted: boolean;
    desc: string;
    displayType: string;
    downloadable: boolean;
    estMinHigh: number;
    estMinLow: number;
    ord: number;
    name: string;
    resources: mongoose.Types.ObjectId[];
    topic: mongoose.Types.ObjectId;
    type: string;
  }

  export class MultipleChoiceQuestion extends mongoose.Model {
    alias: string;
    answers: {
      answerText: string;
      correctAnswerFeedback: string;
      isCorrect: boolean;
      wrongAnswerFeedback: string;
    }[];
    hint: { content: string }[];
    question: {
      template: string;
      data: any;
    };
    name: string;
  }

  export class Resource extends mongoose.Model {
    alias: string;
    assets: {
      name: string;
      type: string;
      uri: string;
    }[];
    contentType: string;
    duration: number;
    isCmiAU: boolean;
    explorationLevel: number;
    knowledgeComponents: KnowledgeComponentRelevance[];
    name: string;
    type: string;
    uri: string;
  }

  export class Topic extends mongoose.Model {
    alias: string;
    name: string;
    recommender: string;
    knowledgeComponents: KnowledgeComponentRelevance[];
    prerequisiteTopics: mongoose.Types.ObjectId[];

    findLessons: () => Promise<Lesson[]>;
  }

  export class User extends mongoose.Model {
    creationDeviceId: string;
    deleted: boolean;
    deletedReason: string;
    email: string;
    lastDeviceId: string;
    lastLoginAt: Date;
    name: string;
    nameLower: string;
    password: string;
    type: string;

    static authenticate: (accessToken: string) => Promise<User | null>;

    static deleteAccount: (reason: string) => Promise<User>;

    static findActive: (query: any) => Promise<User[]>;

    static findActiveById: (
      userId: string | mongoose.Types.ObjectId
    ) => Promise<User>;

    static findOneActive: (query: any) => Promise<User>;

    isDemoUser: () => boolean;

    static isEmailAvailable: (userName: string) => Promise<boolean>;

    static isUserNameAvailable: (userName: string) => Promise<boolean>;

    static login: (
      userId: string | mongoose.Types.ObjectId,
      deviceId: string
    ) => Promise<User>;

    static loginWithCredentials: (
      userNameOrEmail: string,
      password: string,
      deviceId: string
    ) => Promise<User>;

    static resetPassword: (userName: string, password: string) => Promise<User>;

    static signUpWithCredentials: (
      userName: string,
      password: string,
      email: string,
      deviceId: string
    ) => Promise<User>;
  }

  export class UserAccessToken extends mongoose.Model {
    accessToken: string;
    resetPasswordExpires: Date;
    resetPasswordToken: string;
    user: mongoose.Types.ObjectId;
  }

  export class UserGoal extends mongoose.Model {
    activeFocus: string;
    activeGoal: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;

    static findForUser: (user: User) => UserGoal;

    static saveGoalAndFocus: (
      user: User,
      goal: string,
      focus?: string
    ) => Promise<void>;
  }

  export class UserKnowledgeComponent extends mongoose.Model {
    asymptote: number;
    avgTimeDecay: number;
    kc: mongoose.Types.ObjectId;
    mastery: number;
    timestamp: Date;
    static insertOrUpdateIfNewer: (
      user: User,
      kc: KnowledgeComponent,
      update: {
        mastery: number;
        timestamp: Date;
        avgTimeDecay: number;
        asymptote: number;
      }
    ) => Promise<void>;
  }

  export class UserLessonSession extends mongoose.Model {
    user: mongoose.Types.ObjectId;
    lesson: mongoose.Types.ObjectId;
    resourceStatuses: {
      isTerminationPending: boolean;
      resource: mongoose.Types.ObjectId;
    };
    session: string;

    static findOneByUserAndSession: (
      user: User,
      session: string
    ) => Promise<UserLessonSession>;

    static isResourceTerminationPending: (
      user: User | string | mongoose.Types.ObjectId,
      session: string,
      resource: Resource | string | mongoose.Types.ObjectId
    ) => Promise<boolean>;

    static saveUserLessonSession: (
      user: User,
      session: string,
      lesson: Lesson
    ) => Promise<UserLessonSession>;

    static setResourceTerminationPending: (
      user: User | string | mongoose.Types.ObjectId,
      session: string,
      resource: Resource | string | mongoose.Types.ObjectId,
      terminationPending: boolean = true
    ) => Promise<UserLessonSession>;
  }
}
