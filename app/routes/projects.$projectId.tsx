import { useState } from "react";
import { Link, useLoaderData, useActionData, useNavigation, Form, redirect } from "react-router";
import { requireUser } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { logout } from "~/utils/session.server";
import { Button, Card, CardBody, Input, Modal, Alert, SkeletonProjectDetail, Header } from "~/components/ui";
import { useToggle, useSearch } from "~/hooks";

type LoaderData = {
  project: {
    id: string;
    name: string;
    description: string | null;
    ownerId: string;
    owner: { name: string; email: string };
    members: Array<{
      id: string;
      userId: string;
      user: { id: string; name: string; email: string };
    }>;
    notes: Array<{
      id: string;
      contactName: string;
      contactEmail: string | null;
      notes: string;
      createdAt: Date;
      user: { name: string };
    }>;
  };
  user: {
    id: string;
    email: string;
    name: string;
  };
  availableUsers: Array<{
    id: string;
    name: string;
    email: string;
  }>;
  isOwner: boolean;
};

type ActionData = {
  error?: string;
  intent?: string;
};

export async function loader({ request, params }: { request: Request; params: { projectId: string } }) {
  const user = await requireUser(request);
  const { projectId } = params;

  if (!projectId) {
    throw new Response("Not Found", { status: 404 });
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      owner: { select: { name: true, email: true } },
      members: {
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      },
      notes: {
        include: {
          user: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!project) {
    throw new Response("Not Found", { status: 404 });
  }

  // Check if user has access to this project
  const isMember = project.members.some((m) => m.userId === user.id);
  const isOwner = project.ownerId === user.id;

  if (!isOwner && !isMember) {
    throw new Response("Forbidden", { status: 403 });
  }

  // Get users who are not already members
  const memberUserIds = project.members.map((m) => m.userId);
  const availableUsers = await prisma.user.findMany({
    where: {
      id: { notIn: memberUserIds },
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
    orderBy: { name: "asc" },
  });

  return { project, user, availableUsers, isOwner };
}

export async function action({ request, params }: { request: Request; params: { projectId: string } }): Promise<Response | ActionData> {
  const user = await requireUser(request);
  const { projectId } = params;

  if (!projectId) {
    throw new Response("Not Found", { status: 404 });
  }

  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  // Handle logout
  if (intent === "logout") {
    return logout(request);
  }

  // Verify user is project owner
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  });

  if (!project) {
    throw new Response("Not Found", { status: 404 });
  }

  if (intent === "add-member") {
    if (project.ownerId !== user.id) {
      throw new Response("Forbidden", { status: 403 });
    }

    const userIdToAdd = formData.get("userId") as string;

    try {
      // Check if user is already a member
      const existingMember = await prisma.projectMember.findUnique({
        where: {
          userId_projectId: {
            userId: userIdToAdd,
            projectId,
          },
        },
      });

      if (!existingMember) {
        await prisma.projectMember.create({
          data: {
            userId: userIdToAdd,
            projectId,
            role: "member",
          },
        });
      }
    } catch (error) {
      console.error("Error adding member:", error);
      return {
        error: "Failed to add member. Please try again.",
        intent,
      };
    }
  }

  if (intent === "add-members") {
    if (project.ownerId !== user.id) {
      throw new Response("Forbidden", { status: 403 });
    }

    const userIds = formData.getAll("userIds") as string[];

    try {
      // Add all selected users as members
      for (const userIdToAdd of userIds) {
        // Check if user is already a member
        const existingMember = await prisma.projectMember.findUnique({
          where: {
            userId_projectId: {
              userId: userIdToAdd,
              projectId,
            },
          },
        });

        if (!existingMember) {
          await prisma.projectMember.create({
            data: {
              userId: userIdToAdd,
              projectId,
              role: "member",
            },
          });
        }
      }
    } catch (error) {
      console.error("Error adding members:", error);
      return {
        error: "Failed to add members. Please try again.",
        intent,
      };
    }
  }

  if (intent === "remove-member") {
    if (project.ownerId !== user.id) {
      throw new Response("Forbidden", { status: 403 });
    }

    const memberIdToRemove = formData.get("memberId") as string;

    try {
      await prisma.projectMember.delete({
        where: { id: memberIdToRemove },
      });
    } catch (error) {
      console.error("Error removing member:", error);
      return {
        error: "Failed to remove member. The member may have already been removed.",
        intent,
      };
    }
  }

  return redirect(`/projects/${projectId}`);
}

export default function ProjectDetailPage() {
  const { project, user, availableUsers, isOwner } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();

  // Custom hooks
  const membersModal = useToggle();
  const inviteModal = useToggle();
  const exportState = useToggle();

  const { searchQuery, filteredItems: filteredNotes, handleSearch } = useSearch(
    project.notes,
    (note, query) =>
      note.contactName.toLowerCase().includes(query) ||
      note.contactEmail?.toLowerCase().includes(query) ||
      note.notes.toLowerCase().includes(query)
  );

  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());

  // Show skeleton when navigating to project page
  if (navigation.state === "loading") {
    return <SkeletonProjectDetail />;
  }

  const toggleUserSelection = (userId: string) => {
    setSelectedUserIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const handleBackToMembers = () => {
    inviteModal.close();
    membersModal.open();
    setSelectedUserIds(new Set()); // Clear selections when going back
  };

  const handleExportCSV = () => {
    if (exportState.isOpen) return; // Prevent multiple clicks
    exportState.open();
    // Trigger download after showing success state
    setTimeout(() => {
      window.location.href = `/projects/${project.id}/export-csv`;
      // Reset state after download starts
      setTimeout(() => {
        exportState.close();
      }, 2000);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        user={user}
        backButton={{ to: "/dashboard", tooltip: "Back to Dashboard" }}
      />

      {/* Main Content */}
      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Project Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
              {project.description && (
                <p className="text-gray-600 mt-2">{project.description}</p>
              )}
              <p className="text-xs text-gray-500 font-bold">
                {project.owner.name}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="md"
                onClick={membersModal.open}
                className="flex items-center"
              >
                <svg aria-hidden="true" className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span>{project.members.length} Members</span>
              </Button>
              <Link to={`/projects/${project.id}/notes/new`}>
                <Button variant="primary" size="md">
                  + New Note
                </Button>
              </Link>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex items-center space-x-4">
            <div className="flex-1 max-w-md">
              <Input
                type="text"
                label="Search notes"
                placeholder="Search notes by name, email, or content..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <Button
              variant="secondary"
              size="md"
              onClick={handleExportCSV}
              className="flex items-center"
            >
              {exportState.isOpen ? (
                <>
                  <svg aria-hidden="true" className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Done</span>
                </>
              ) : (
                <>
                  <svg aria-hidden="true" className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Export CSV</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Notes List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Canvassing Notes ({filteredNotes.length})
          </h2>

          {filteredNotes.length === 0 ? (
            <Card variant="bordered" className="p-12 text-center">
              <div className="flex flex-col items-center">
                <svg aria-hidden="true" className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {searchQuery ? "No notes found" : "No notes yet"}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery
                    ? "Try adjusting your search query"
                    : "Start canvassing and create your first note"}
                </p>
                {!searchQuery && (
                  <Link to={`/projects/${project.id}/notes/new`}>
                    <Button variant="primary">Create Note</Button>
                  </Link>
                )}
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredNotes.map((note) => (
                <Link key={note.id} to={`/projects/${project.id}/notes/${note.id}`}>
                  <Card variant="bordered" className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardBody>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {note.contactName}
                            </h3>
                          </div>
                          {note.contactEmail && (
                            <p className="text-sm text-gray-600 mb-2">
                              <svg aria-hidden="true" className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              {note.contactEmail}
                            </p>
                          )}
                          {note.notes && (
                            <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                              {note.notes}
                            </p>
                          )}
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>By {note.user.name}</span>
                            <span>•</span>
                            <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <svg aria-hidden="true" className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </CardBody>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Members Modal */}
      <Modal
        isOpen={membersModal.isOpen}
        onClose={membersModal.close}
        title="Project Members"
        size="md"
      >
        <div className="space-y-4">
          {/* Error Alert */}
          {actionData?.error && actionData.intent === "remove-member" && (
            <Alert variant="error">
              {actionData.error}
            </Alert>
          )}

          {/* All Members */}
          {project.members.map((member) => {
            const isProjectOwner = member.userId === project.ownerId;
            return (
              <div
                key={member.id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  isProjectOwner ? "bg-primary-50" : "border border-gray-200"
                }`}
              >
                <div>
                  <p className="font-medium text-gray-900">{member.user.name}</p>
                  <p className="text-sm text-gray-600">{member.user.email}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {isProjectOwner && (
                    <span className="px-2 py-1 text-xs font-medium bg-primary-600 text-white rounded">
                      Owner
                    </span>
                  )}
                  {isOwner && !isProjectOwner && (
                    <Form method="post">
                      <input type="hidden" name="intent" value="remove-member" />
                      <input type="hidden" name="memberId" value={member.id} />
                      <Button
                        type="submit"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          if (!confirm(`Remove ${member.user.name} from this project?`)) {
                            e.preventDefault();
                          }
                        }}
                      >
                        <svg aria-hidden="true" className="w-4 h-4 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </Button>
                    </Form>
                  )}
                </div>
              </div>
            );
          })}

          {isOwner && (
            <Button
              variant="outline"
              fullWidth
              onClick={() => {
                setSelectedUserIds(new Set()); // Clear selections when opening invite modal
                membersModal.close();
                inviteModal.open();
              }}
            >
              + Invite Member
            </Button>
          )}
        </div>
      </Modal>

      {/* Invite Member Modal */}
      <Modal
        isOpen={inviteModal.isOpen}
        onClose={() => {
          inviteModal.close();
          setSelectedUserIds(new Set());
        }}
        title="Invite Member"
        size="md"
      >
        <div className="space-y-4">
          <button
            onClick={handleBackToMembers}
            className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900 transition-colors -mt-2 mb-2"
          >
            <svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Members</span>
          </button>

          {/* Error Alert */}
          {actionData?.error && (actionData.intent === "add-member" || actionData.intent === "add-members") && (
            <Alert variant="error">
              {actionData.error}
            </Alert>
          )}

          <p className="text-sm text-gray-600">
            Select users to add to this project:
          </p>

          {availableUsers.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <p>All registered users are already members of this project.</p>
            </div>
          ) : (
            <>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {availableUsers.map((availableUser) => {
                  const isSelected = selectedUserIds.has(availableUser.id);
                  return (
                    <button
                      key={availableUser.id}
                      type="button"
                      onClick={() => toggleUserSelection(availableUser.id)}
                      className={`w-full flex items-center justify-between p-3 border rounded-lg transition-all text-left ${
                        isSelected
                          ? "border-primary-600 bg-primary-50"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <div>
                        <p className="font-medium text-gray-900">{availableUser.name}</p>
                        <p className="text-sm text-gray-600">{availableUser.email}</p>
                      </div>
                      {isSelected ? (
                        <svg
                          aria-hidden="true"
                          className="w-5 h-5 text-primary-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        <svg
                          aria-hidden="true"
                          className="w-5 h-5 text-primary-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>

              {selectedUserIds.size > 0 && (
                <Form method="post">
                  <input type="hidden" name="intent" value="add-members" />
                  {Array.from(selectedUserIds).map((userId) => (
                    <input key={userId} type="hidden" name="userIds" value={userId} />
                  ))}
                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                  >
                    Add {selectedUserIds.size} {selectedUserIds.size === 1 ? "Member" : "Members"}
                  </Button>
                </Form>
              )}
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
