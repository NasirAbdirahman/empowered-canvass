import { Link, useLoaderData, useNavigation } from "react-router";
import { requireUser } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { logout } from "~/utils/session.server";
import { Button, Card, CardHeader, CardBody, Input, SkeletonDashboard, Header } from "~/components/ui";
import { useSearch } from "~/hooks";

export async function loader({ request }: { request: Request }) {
  const user = await requireUser(request);

  // Get user's projects
  const projects = await prisma.project.findMany({
    where: {
      OR: [
        { ownerId: user.id },
        { members: { some: { userId: user.id } } }
      ]
    },
    include: {
      owner: { select: { name: true, email: true } },
      _count: { select: { notes: true, members: true } }
    },
    orderBy: { updatedAt: "desc" }
  });

  return { user, projects };
}

export async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "logout") {
    return logout(request);
  }

  return null;
}

export default function Dashboard() {
  const { user, projects } = useLoaderData<typeof loader>();
  const navigation = useNavigation();

  const { searchQuery, filteredItems: filteredProjects, handleSearch } = useSearch(
    projects,
    (project, query) => project.name.toLowerCase().includes(query)
  );

  // Show skeleton when navigating to dashboard (between pages)
  if (navigation.state === "loading") {
    return <SkeletonDashboard />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />

      {/* Main Content */}
      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Projects</h2>
              <p className="text-gray-600 mt-1">
                Manage your canvassing projects and track progress
              </p>
            </div>
            <Link to="/projects/new">
              <Button variant="primary" size="lg">
                + New Project
              </Button>
            </Link>
          </div>

          {/* Search Bar */}
          {projects.length > 0 && (
            <div className="max-w-md">
              <Input
                type="text"
                label="Search projects"
                placeholder="Search projects by name..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <Card variant="bordered" className="p-12 text-center">
            <div className="flex flex-col items-center">
              <svg
                aria-hidden="true"
                className="w-16 h-16 text-gray-300 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No projects yet
              </h3>
              <p className="text-gray-600 mb-6">
                Get started by creating your first canvassing project
              </p>
              <Link to="/projects/new">
                <Button variant="primary">Create Project</Button>
              </Link>
            </div>
          </Card>
        ) : filteredProjects.length === 0 ? (
          <Card variant="bordered" className="p-12 text-center">
            <div className="flex flex-col items-center">
              <svg
                aria-hidden="true"
                className="w-16 h-16 text-gray-300 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No projects found
              </h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search query
              </p>
              <Button variant="outline" onClick={() => handleSearch("")}>
                Clear Search
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Link key={project.id} to={`/projects/${project.id}`}>
                <Card
                  variant="bordered"
                  className="hover:shadow-lg transition-shadow cursor-pointer h-full"
                >
                  <CardHeader>
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {project.name}
                    </h3>
                  </CardHeader>
                  <CardBody className="space-y-4">
                    {project.description && (
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {project.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-gray-500">
                        <svg
                          aria-hidden="true"
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        {project._count.notes} notes
                      </div>

                      <div className="flex items-center text-gray-500">
                        <svg
                          aria-hidden="true"
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                          />
                        </svg>
                        {project._count.members} members
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-500 font-bold">
                        {project.owner.name}
                      </p>
                    </div>
                  </CardBody>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
