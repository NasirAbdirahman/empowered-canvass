import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/login.tsx"),
  route("/register", "routes/register.tsx"),
  route("/dashboard", "routes/dashboard.tsx"),
  route("/projects/new", "routes/projects.new.tsx"),
  route("/projects/:projectId", "routes/projects.$projectId.tsx"),
  route("/projects/:projectId/export-csv", "routes/projects.$projectId.export-csv.tsx"),
  route("/projects/:projectId/notes/new", "routes/projects.$projectId.notes.new.tsx"),
  route("/projects/:projectId/notes/:noteId", "routes/projects.$projectId.notes.$noteId.tsx"),
] satisfies RouteConfig;
