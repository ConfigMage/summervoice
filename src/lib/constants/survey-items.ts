export interface SurveyItem {
  id: number;
  text: string;
  category: string;
  scale: string[];
  isAnchor: boolean;
  isReverseCoded: boolean;
}

export const SURVEY_ITEMS: SurveyItem[] = [
  // Category: People — Peers
  { id: 1, text: "Students in this summer program treat each other with respect", category: "People — Peers", scale: ["strongly_agree", "agree", "disagree", "strongly_disagree"], isAnchor: false, isReverseCoded: false },
  { id: 2, text: "I worry about people hurting each other during the summer program", category: "People — Peers", scale: ["strongly_agree", "agree", "disagree", "strongly_disagree"], isAnchor: false, isReverseCoded: true },
  { id: 3, text: "The students in the summer program care about me", category: "People — Peers", scale: ["strongly_agree", "agree", "disagree", "strongly_disagree"], isAnchor: false, isReverseCoded: false },
  { id: 4, text: "I have friends at my summer program", category: "People — Peers", scale: ["strongly_agree", "agree", "disagree", "strongly_disagree"], isAnchor: true, isReverseCoded: false },
  { id: 5, text: "I feel connected to others at this summer program", category: "People — Peers", scale: ["strongly_agree", "agree", "disagree", "strongly_disagree"], isAnchor: false, isReverseCoded: false },
  { id: 6, text: "I feel safe talking with students at my summer program", category: "People — Peers", scale: ["strongly_agree", "agree", "disagree", "strongly_disagree"], isAnchor: false, isReverseCoded: false },
  { id: 7, text: "The people at my summer program understand me as a person", category: "People — Peers", scale: ["strongly_agree", "agree", "disagree", "strongly_disagree"], isAnchor: false, isReverseCoded: false },

  // Category: People — Adults
  { id: 8, text: "Adults in this summer program treat all students with respect", category: "People — Adults", scale: ["strongly_agree", "agree", "disagree", "strongly_disagree"], isAnchor: false, isReverseCoded: false },
  { id: 9, text: "It is easy to talk with teachers and other adults at this summer program", category: "People — Adults", scale: ["strongly_agree", "agree", "disagree", "strongly_disagree"], isAnchor: false, isReverseCoded: false },
  { id: 10, text: "There is at least one teacher or other adult in my summer program that really cares about me", category: "People — Adults", scale: ["strongly_agree", "agree", "disagree", "strongly_disagree"], isAnchor: true, isReverseCoded: false },

  // Category: Program — Climate & Engagement
  { id: 11, text: "I feel safe at my summer program", category: "Program — Climate & Engagement", scale: ["strongly_agree", "agree", "disagree", "strongly_disagree"], isAnchor: true, isReverseCoded: false },
  { id: 12, text: "I feel welcome at my summer program", category: "Program — Climate & Engagement", scale: ["strongly_agree", "agree", "disagree", "strongly_disagree"], isAnchor: true, isReverseCoded: false },
  { id: 13, text: "I like going to my summer program", category: "Program — Climate & Engagement", scale: ["strongly_agree", "agree", "disagree", "strongly_disagree"], isAnchor: false, isReverseCoded: false },
  { id: 14, text: "I am excited to come to this summer program", category: "Program — Climate & Engagement", scale: ["strongly_agree", "agree", "disagree", "strongly_disagree"], isAnchor: false, isReverseCoded: false },
  { id: 15, text: "I like the activities we do in my summer program", category: "Program — Climate & Engagement", scale: ["strongly_agree", "agree", "disagree", "strongly_disagree"], isAnchor: true, isReverseCoded: false },
  { id: 16, text: "I have opportunities to participate in activities that align with my interests", category: "Program — Climate & Engagement", scale: ["strongly_agree", "agree", "disagree", "strongly_disagree"], isAnchor: false, isReverseCoded: false },
  { id: 17, text: "I have lots of choices of activities to do in this summer program", category: "Program — Climate & Engagement", scale: ["strongly_agree", "agree", "disagree", "strongly_disagree"], isAnchor: false, isReverseCoded: false },
  { id: 18, text: "At my summer program, I have opportunities to create activities, or plan events/activities", category: "Program — Climate & Engagement", scale: ["strongly_agree", "agree", "disagree", "strongly_disagree"], isAnchor: false, isReverseCoded: false },
  { id: 19, text: "Adults give me the chance to share my ideas and opinions in the program", category: "Program — Climate & Engagement", scale: ["strongly_agree", "agree", "disagree", "strongly_disagree"], isAnchor: false, isReverseCoded: false },
  { id: 20, text: "I have enjoyed reading during the summer program", category: "Program — Climate & Engagement", scale: ["strongly_agree", "agree", "disagree", "strongly_disagree"], isAnchor: false, isReverseCoded: false },

  // Category: Social-Emotional & Cultural
  { id: 21, text: "At this summer program, students talk about the importance of understanding their own feelings and the feelings of others", category: "Social-Emotional & Cultural", scale: ["strongly_agree", "agree", "disagree", "strongly_disagree"], isAnchor: false, isReverseCoded: false },
  { id: 22, text: "At this summer program, students work on listening to others to understand what they are trying to say", category: "Social-Emotional & Cultural", scale: ["strongly_agree", "agree", "disagree", "strongly_disagree"], isAnchor: false, isReverseCoded: false },
  { id: 23, text: "In this program, I learn more about different cultures, personal histories, and traditions", category: "Social-Emotional & Cultural", scale: ["strongly_agree", "agree", "disagree", "strongly_disagree"], isAnchor: false, isReverseCoded: false },
  { id: 24, text: "My culture, personal history, and family traditions are celebrated in this program", category: "Social-Emotional & Cultural", scale: ["strongly_agree", "agree", "disagree", "strongly_disagree"], isAnchor: true, isReverseCoded: false },
  { id: 25, text: "I have been given opportunities to explore careers/jobs in my summer program", category: "Social-Emotional & Cultural", scale: ["strongly_agree", "agree", "disagree", "strongly_disagree"], isAnchor: false, isReverseCoded: false },

  // Category: Belonging
  { id: 26, text: "Do you feel like you belong in your summer program?", category: "Belonging", scale: ["yes", "no"], isAnchor: true, isReverseCoded: false },

  // Category: Career Connection
  { id: 27, text: "How often do you connect what you are learning in the program to potential career opportunities?", category: "Career Connection", scale: ["often", "sometimes", "rarely", "never"], isAnchor: false, isReverseCoded: false },

  // Category: Field Trips & Outdoor Activities
  { id: 28, text: "How many times have you visited another location (e.g., field trip, museum, university, aquarium, library, park) as part of your program?", category: "Field Trips & Outdoor Activities", scale: ["often", "sometimes", "rarely", "never"], isAnchor: false, isReverseCoded: false },
  { id: 29, text: "How many times have you spent time doing activities outside (e.g., outdoor learning, science, water activities, hiking, outdoor field trips, camping) during your summer program?", category: "Field Trips & Outdoor Activities", scale: ["often", "sometimes", "rarely", "never"], isAnchor: false, isReverseCoded: false },

  // Category: Participation
  { id: 30, text: "I am able to participate in all the activities that are offered in my summer program", category: "Participation", scale: ["always", "often", "sometimes", "never"], isAnchor: false, isReverseCoded: false },

  // Category: Representation & Diversity
  { id: 31, text: "Adults in my summer program respect people from different backgrounds (for example, people of different races, cultures, religions, genders, sexual orientation, or people of different abilities)", category: "Representation & Diversity", scale: ["strongly_agree", "agree", "disagree", "strongly_disagree"], isAnchor: false, isReverseCoded: false },
  { id: 32, text: "There are students in this program who are like me and my family", category: "Representation & Diversity", scale: ["strongly_agree", "agree", "disagree", "strongly_disagree"], isAnchor: false, isReverseCoded: false },
  { id: 33, text: "There are adults at my summer program who are like me and my family", category: "Representation & Diversity", scale: ["strongly_agree", "agree", "disagree", "strongly_disagree"], isAnchor: false, isReverseCoded: false },

  // Category: Representation — Materials
  { id: 34, text: "How often did materials have pictures or stories of people who are like you and your family?", category: "Representation — Materials", scale: ["a_lot", "sometimes", "rarely", "never"], isAnchor: false, isReverseCoded: false },

  // Category: Reading & Writing
  { id: 35, text: "This program has helped me become a better reader and writer", category: "Reading & Writing", scale: ["strongly_agree", "agree", "disagree", "strongly_disagree"], isAnchor: false, isReverseCoded: false },

  // Category: Self-Concept & Growth
  { id: 36, text: "The summer program has helped me feel good about myself", category: "Self-Concept & Growth", scale: ["strongly_agree", "agree", "disagree", "strongly_disagree"], isAnchor: false, isReverseCoded: false },
  { id: 37, text: "The summer program has helped me try new things", category: "Self-Concept & Growth", scale: ["strongly_agree", "agree", "disagree", "strongly_disagree"], isAnchor: true, isReverseCoded: false },
  { id: 38, text: "I feel more confident in myself while I'm at this program", category: "Self-Concept & Growth", scale: ["strongly_agree", "agree", "disagree", "strongly_disagree"], isAnchor: false, isReverseCoded: false },
  { id: 39, text: "This program helps me stay active and healthy", category: "Self-Concept & Growth", scale: ["strongly_agree", "agree", "disagree", "strongly_disagree"], isAnchor: false, isReverseCoded: false },
  { id: 40, text: "This program helps me get along with other students", category: "Self-Concept & Growth", scale: ["strongly_agree", "agree", "disagree", "strongly_disagree"], isAnchor: false, isReverseCoded: false },
  { id: 41, text: "This program has helped me understand what I read better", category: "Self-Concept & Growth", scale: ["strongly_agree", "agree", "disagree", "strongly_disagree"], isAnchor: true, isReverseCoded: false },
  { id: 42, text: "This program has helped me share my ideas more clearly", category: "Self-Concept & Growth", scale: ["strongly_agree", "agree", "disagree", "strongly_disagree"], isAnchor: false, isReverseCoded: false },

  // Category: Personal Skills & Resilience
  { id: 43, text: "I ask for help when things are not going well", category: "Personal Skills & Resilience", scale: ["strongly_agree", "agree", "disagree", "strongly_disagree"], isAnchor: false, isReverseCoded: false },
  { id: 44, text: "I keep trying even when things get hard", category: "Personal Skills & Resilience", scale: ["strongly_agree", "agree", "disagree", "strongly_disagree"], isAnchor: true, isReverseCoded: false },
  { id: 45, text: "I am able to control my feelings when I need to", category: "Personal Skills & Resilience", scale: ["strongly_agree", "agree", "disagree", "strongly_disagree"], isAnchor: false, isReverseCoded: false },
  { id: 46, text: "I am able to connect what we are learning in class to things happening outside of school", category: "Personal Skills & Resilience", scale: ["strongly_agree", "agree", "disagree", "strongly_disagree"], isAnchor: false, isReverseCoded: false },
  { id: 47, text: "I believe I can make a contribution to my community", category: "Personal Skills & Resilience", scale: ["strongly_agree", "agree", "disagree", "strongly_disagree"], isAnchor: false, isReverseCoded: false },
  { id: 48, text: "I feel connected with my community", category: "Personal Skills & Resilience", scale: ["strongly_agree", "agree", "disagree", "strongly_disagree"], isAnchor: false, isReverseCoded: false },
  { id: 49, text: "I can help solve problems and deal with conflicts", category: "Personal Skills & Resilience", scale: ["strongly_agree", "agree", "disagree", "strongly_disagree"], isAnchor: false, isReverseCoded: false },
  { id: 50, text: "I know how to be creative (for example, use my imagination or improve on ideas/processes)", category: "Personal Skills & Resilience", scale: ["strongly_agree", "agree", "disagree", "strongly_disagree"], isAnchor: false, isReverseCoded: false },
];

export function getSurveyItemsText(): string {
  return SURVEY_ITEMS.map(
    (item) => `${item.id}. [${item.category}] ${item.text} (Scale: ${item.scale.join(" | ")})`
  ).join("\n");
}
