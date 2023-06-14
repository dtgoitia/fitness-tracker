/**
 * IMPORTANT: if you omit the leading `/`, the path will be relative and
 * therefore appended to the current path
 */
enum Paths {
  root = "/",
  history = "/history",
  activities = "/activities",
  activityEditor = "/activities/:activityId",
  trainings = "/trainings",
  trainingEditor = "/trainings/:trainingId",
  stats = "/stats",
  shortcuts = "/shortcuts",
  notFound = "/*",
}

export default Paths;
