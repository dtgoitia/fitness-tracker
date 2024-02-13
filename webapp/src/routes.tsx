/**
 * IMPORTANT: if you omit the leading `/`, the path will be relative and
 * therefore appended to the current path
 */
enum Paths {
  root = "/",
  history = "/history",
  historyRecord = "/history/:completedActivityId",
  activities = "/activities",
  activityEditor = "/activities/:activityId",
  trainables = "/trainables",
  trainableEditor = "/trainables/:trainableId",
  trainings = "/trainings",
  trainingEditor = "/trainings/:trainingId",
  activityStats = "/stats/activities",
  trainableStats = "/stats/trainables",
  shortcuts = "/shortcuts",
  notFound = "/*",
}

export default Paths;
