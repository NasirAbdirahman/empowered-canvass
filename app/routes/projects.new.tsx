import { useState } from "react";
import { Form, Link, useActionData, useLoaderData, redirect } from "react-router";
import { requireUser } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { logout } from "~/utils/session.server";
import { Input, Textarea, Button, Card, CardBody, Alert, Header } from "~/components/ui";
import { useSearch, useFormSubmitting } from "~/hooks";

type ActionData = {
  errors?: {
    name?: string;
    description?: string;
    form?: string;
  };
};

type LoaderData = {
  users: Array<{
    id: string;
    name: string;
    email: string;
  }>;
  user: {
    id: string;
    email: string;
    name: string;
  };
  currentUserId: string;
};

export async function loader({ request }: { request: Request }) {
  const user = await requireUser(request);

  // Get all users except current user for member selection
  const users = await prisma.user.findMany({
    where: {
      id: { not: user.id },
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
    orderBy: { name: "asc" },
  });

  return { users, user, currentUserId: user.id };
}

export async function action({ request }: { request: Request }): Promise<Response | ActionData> {
  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  // Handle logout
  if (intent === "logout") {
    return logout(request);
  }

  const user = await requireUser(request);

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const memberIds = formData.getAll("members") as string[];

  // Validate inputs
  const errors: ActionData["errors"] = {};

  if (!name || name.trim().length === 0) {
    errors.name = "Project name is required";
  } else if (name.length > 100) {
    errors.name = "Project name must be less than 100 characters";
  }

  if (description && description.length > 500) {
    errors.description = "Description must be less than 500 characters";
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  try {
    // Create project with members in a transaction
    const project = await prisma.project.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        ownerId: user.id,
        members: {
          create: [
            // Add owner as member with "owner" role
            {
              userId: user.id,
              role: "owner",
            },
            // Add selected members with "member" role
            ...memberIds.map((userId) => ({
              userId,
              role: "member",
            })),
          ],
        },
      },
    });

    return redirect(`/projects/${project.id}`);
  } catch (error) {
    console.error("Error creating project:", error);
    return {
      errors: {
        form: "Failed to create project. Please try again.",
      },
    };
  }
}

export default function NewProjectPage() {
  const { users, user, currentUserId } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());

  const isSubmitting = useFormSubmitting();

  const { searchQuery, filteredItems: filteredUsers, handleSearch } = useSearch(
    users,
    (user, query) =>
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
  );

  const toggleMember = (userId: string) => {
    const newSelected = new Set(selectedMembers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedMembers(newSelected);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        user={user}
        backButton={{ to: "/dashboard", tooltip: "Back to Dashboard" }}
      />

      {/* Main Content */}
      <main id="main-content" className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Project</h1>
          <p className="text-gray-600 mt-2">
            Set up a new canvassing project and invite team members
          </p>
        </div>

        {/* Form Error Alert */}
        {actionData?.errors?.form && (
          <Alert variant="error" className="mb-6">
            {actionData.errors.form}
          </Alert>
        )}

        <Form method="post" className="space-y-6">
          {/* Project Details */}
          <Card variant="bordered">
            <CardBody className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Project Details</h2>

              <Input
                name="name"
                type="text"
                label="Project Name"
                placeholder="e.g., City Council Campaign 2025"
                required
                error={actionData?.errors?.name}
                disabled={isSubmitting}
                autoFocus
              />

              <Textarea
                name="description"
                label="Description (optional)"
                placeholder="Describe the goals and purpose of this canvassing project..."
                rows={4}
                error={actionData?.errors?.description}
                disabled={isSubmitting}
                helperText="Brief overview of the project (max 500 characters)"
              />
            </CardBody>
          </Card>

          {/* Team Members */}
          <Card variant="bordered">
            <CardBody className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-1">
                  Team Members (Optional)
                </h2>
                <p className="text-sm text-gray-600">
                  Select team members to collaborate on this project. You can add more later.
                </p>
              </div>

              {/* Search Users */}
              <Input
                type="text"
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />

              {/* User List */}
              <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    {searchQuery ? "No users found" : "No other users available"}
                  </div>
                ) : (
                  filteredUsers.map((user) => (
                    <label
                      key={user.id}
                      className="flex items-center p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        name="members"
                        value={user.id}
                        checked={selectedMembers.has(user.id)}
                        onChange={() => toggleMember(user.id)}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        disabled={isSubmitting}
                      />
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </label>
                  ))
                )}
              </div>

              {selectedMembers.size > 0 && (
                <div className="flex items-center text-sm text-gray-600">
                  <svg aria-hidden="true" className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  {selectedMembers.size} member{selectedMembers.size !== 1 ? "s" : ""} selected
                </div>
              )}
            </CardBody>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4">
            <Link to="/dashboard">
              <Button type="button" variant="outline" disabled={isSubmitting}>
                Cancel
              </Button>
            </Link>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Create Project
            </Button>
          </div>
        </Form>
      </main>
    </div>
  );
}
