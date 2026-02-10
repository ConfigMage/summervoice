# Survey Items — Complete List

All 50 items from the original Student Voice Summer Survey (Grades 5-12). These are provided to the post-interview analyzer so it can rate each one. They should also be stored in the codebase as constants (e.g., `/lib/constants/survey-items.ts`) for use in both the analyzer API call and the admin dashboard.

---

## Category: People — Peers
Scale: strongly_agree | agree | disagree | strongly_disagree

1. Students in this summer program treat each other with respect
2. I worry about people hurting each other during the summer program *(NOTE: reverse-coded — agreement is NEGATIVE)*
3. The students in the summer program care about me
4. I have friends at my summer program ⭐ *ANCHOR ITEM*
5. I feel connected to others at this summer program
6. I feel safe talking with students at my summer program
7. The people at my summer program understand me as a person

## Category: People — Adults
Scale: strongly_agree | agree | disagree | strongly_disagree

8. Adults in this summer program treat all students with respect
9. It is easy to talk with teachers and other adults at this summer program
10. There is at least one teacher or other adult in my summer program that really cares about me ⭐ *ANCHOR ITEM*

## Category: Program — Climate & Engagement
Scale: strongly_agree | agree | disagree | strongly_disagree

11. I feel safe at my summer program ⭐ *ANCHOR ITEM*
12. I feel welcome at my summer program ⭐ *ANCHOR ITEM*
13. I like going to my summer program
14. I am excited to come to this summer program
15. I like the activities we do in my summer program ⭐ *ANCHOR ITEM*
16. I have opportunities to participate in activities that align with my interests
17. I have lots of choices of activities to do in this summer program
18. At my summer program, I have opportunities to create activities, or plan events/activities
19. Adults give me the chance to share my ideas and opinions in the program
20. I have enjoyed reading during the summer program

## Category: Social-Emotional & Cultural
Scale: strongly_agree | agree | disagree | strongly_disagree

21. At this summer program, students talk about the importance of understanding their own feelings and the feelings of others
22. At this summer program, students work on listening to others to understand what they are trying to say
23. In this program, I learn more about different cultures, personal histories, and traditions
24. My culture, personal history, and family traditions are celebrated in this program ⭐ *ANCHOR ITEM*
25. I have been given opportunities to explore careers/jobs in my summer program

## Category: Belonging
Scale: yes | no

26. Do you feel like you belong in your summer program? ⭐ *ANCHOR ITEM (yes/no + follow-up why)*

## Category: Career Connection
Scale: often | sometimes | rarely | never

27. How often do you connect what you are learning in the program to potential career opportunities?

## Category: Field Trips & Outdoor Activities
Scale: often | sometimes | rarely | never
*(often = more than 5 times, sometimes = 3-5 times, rarely = 1-2 times)*

28. How many times have you visited another location (e.g., field trip, museum, university, aquarium, library, park) as part of your program?
29. How many times have you spent time doing activities outside (e.g., outdoor learning, science, water activities, hiking, outdoor field trips, camping) during your summer program?

## Category: Participation
Scale: always | often | sometimes | never

30. I am able to participate in all the activities that are offered in my summer program

## Category: Representation & Diversity
Scale: strongly_agree | agree | disagree | strongly_disagree

31. Adults in my summer program respect people from different backgrounds (for example, people of different races, cultures, religions, genders, sexual orientation, or people of different abilities)
32. There are students in this program who are like me and my family
33. There are adults at my summer program who are like me and my family

## Category: Representation — Materials
Scale: a_lot | sometimes | rarely | never

34. How often did materials have pictures or stories of people who are like you and your family?

## Category: Reading & Writing
Scale: strongly_agree | agree | disagree | strongly_disagree

35. This program has helped me become a better reader and writer

## Category: Self-Concept & Growth
Scale: strongly_agree | agree | disagree | strongly_disagree

36. The summer program has helped me feel good about myself
37. The summer program has helped me try new things ⭐ *ANCHOR ITEM*
38. I feel more confident in myself while I'm at this program
39. This program helps me stay active and healthy
40. This program helps me get along with other students
41. This program has helped me understand what I read better ⭐ *ANCHOR ITEM*
42. This program has helped me share my ideas more clearly

## Category: Personal Skills & Resilience
Scale: strongly_agree | agree | disagree | strongly_disagree

43. I ask for help when things are not going well
44. I keep trying even when things get hard ⭐ *ANCHOR ITEM*
45. I am able to control my feelings when I need to
46. I am able to connect what we are learning in class to things happening outside of school
47. I believe I can make a contribution to my community
48. I feel connected with my community
49. I can help solve problems and deal with conflicts
50. I know how to be creative (for example, use my imagination or improve on ideas/processes)

---

## Notes

- ⭐ = Anchor item (10 total). These are explicitly asked during the interview with direct ratings. The analyzer should mark these as source: "direct" when the student clearly answered.
- Item 2 is reverse-coded. "Strongly agree" on "I worry about people hurting each other" is a NEGATIVE signal.
- Items use different scales — the analyzer must use the correct scale for each item.
