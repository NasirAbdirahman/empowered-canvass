import { useEffect } from "react";
import { Form, useActionData, useLoaderData, useNavigation, redirect } from "react-router";
import { requireUser } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { logout } from "~/utils/session.server";
import { Input, Textarea, Button, Card, CardBody, Alert, Modal, SkeletonNoteDetail, Header } from "~/components/ui";
import { validateEmail } from "~/utils/validation";
import { useToggle, useFormSubmitting } from "~/hooks";

type ActionData = {
  errors?: {
    contactName?: string;
    contactEmail?: string;
    notes?: string;
    form?: string;
  };
};

type LoaderData = {
  project: {
    id: string;
    name: string;
    ownerId: string;
  };
  note: {
    id: string;
    contactName: string;
    contactEmail: string | null;
    notes: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    user: {
      name: string;
    };
  };
  user: {
    id: string;
    email: string;
    name: string;
  };
  isNoteOwner: boolean;
  isProjectOwner: boolean;
};

export async function loader({
  request,
  params,
}: {
  request: Request;
  params: { projectId: string; noteId: string };
}) {
  const user = await requireUser(request);
  const { projectId, noteId } = params;

  if (!projectId || !noteId) {
    throw new Response("Not Found", { status: 404 });
  }

  // Get project and note
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      OR: [
        { ownerId: user.id },
        { members: { some: { userId: user.id } } },
      ],
    },
    select: {
      id: true,
      name: true,
      ownerId: true,
    },
  });

  if (!project) {
    throw new Response("Forbidden", { status: 403 });
  }

  const note = await prisma.canvassingNote.findUnique({
    where: { id: noteId },
    include: {
      user: { select: { name: true } },
    },
  });

  if (!note || note.projectId !== projectId) {
    throw new Response("Not Found", { status: 404 });
  }

  return {
    project,
    note,
    user,
    isNoteOwner: note.userId === user.id,
    isProjectOwner: project.ownerId === user.id,
  };
}

export async function action({
  request,
  params,
}: {
  request: Request;
  params: { projectId: string; noteId: string };
}): Promise<Response | ActionData> {
  const formData = await request.formData();
  const intent = formData.get("intent");

  // Handle logout
  if (intent === "logout") {
    return logout(request);
  }

  const user = await requireUser(request);
  const { projectId, noteId } = params;

  if (!projectId || !noteId) {
    throw new Response("Not Found", { status: 404 });
  }

  // Handle delete
  if (intent === "delete") {
    const note = await prisma.canvassingNote.findUnique({
      where: { id: noteId },
      select: { userId: true, projectId: true, project: { select: { ownerId: true } } },
    });

    if (!note || note.projectId !== projectId) {
      throw new Response("Not Found", { status: 404 });
    }

    // Only note owner or project owner can delete
    if (note.userId !== user.id && note.project.ownerId !== user.id) {
      throw new Response("Forbidden", { status: 403 });
    }

    await prisma.canvassingNote.delete({
      where: { id: noteId },
    });

    return redirect(`/projects/${projectId}`);
  }

  // Handle update
  if (intent === "update") {
    const contactName = formData.get("contactName") as string;
    const contactEmail = formData.get("contactEmail") as string;
    const notes = formData.get("notes") as string;

    // Validate inputs
    const errors: ActionData["errors"] = {};

    if (!contactName || contactName.trim().length === 0) {
      errors.contactName = "Contact name is required";
    } else if (contactName.length > 100) {
      errors.contactName = "Contact name must be less than 100 characters";
    }

    if (contactEmail && contactEmail.trim().length > 0) {
      const emailError = validateEmail(contactEmail);
      if (emailError) {
        errors.contactEmail = emailError;
      }
    }

    if (!notes || notes.trim().length === 0) {
      errors.notes = "Notes are required";
    } else if (notes.length > 5000) {
      errors.notes = "Notes must be less than 5000 characters";
    }

    if (Object.keys(errors).length > 0) {
      return { errors };
    }

    try {
      // Verify user is note owner
      const note = await prisma.canvassingNote.findUnique({
        where: { id: noteId },
        select: { userId: true, projectId: true },
      });

      if (!note || note.projectId !== projectId || note.userId !== user.id) {
        throw new Response("Forbidden", { status: 403 });
      }

      // Update note
      await prisma.canvassingNote.update({
        where: { id: noteId },
        data: {
          contactName: contactName.trim(),
          contactEmail: contactEmail?.trim() || null,
          notes: notes.trim(),
        },
      });

      // Redirect to reload the page with updated data
      return redirect(`/projects/${projectId}/notes/${noteId}`);
    } catch (error) {
      console.error("Error updating note:", error);
      return {
        errors: {
          form: "Failed to update note. Please try again.",
        },
      };
    }
  }

  return { errors: {} };
}

export default function NoteDetailPage() {
  const { project, note, user, isNoteOwner, isProjectOwner } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();

  const editMode = useToggle();
  const deleteModal = useToggle();
  const isSubmitting = useFormSubmitting();

  const canEdit = isNoteOwner;
  const canDelete = isNoteOwner || isProjectOwner;

  // Exit edit mode when navigation completes (after successful update)
  useEffect(() => {
    if (navigation.state === "idle" && !actionData?.errors) {
      editMode.close();
    }
  }, [navigation.state, actionData, editMode]);

  // Show skeleton when navigating to note page
  if (navigation.state === "loading") {
    return <SkeletonNoteDetail />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        user={user}
        backButton={{ to: `/projects/${project.id}`, tooltip: "Back to Project" }}
      />

      {/* Main Content */}
      <main id="main-content" className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Canvassing Note</h1>
            <p className="text-gray-600 mt-2">{project.name}</p>
          </div>
          <div className="flex items-center space-x-2">
            {canEdit && !editMode.isOpen && (
              <Button variant="outline" size="md" onClick={editMode.open}>
                Edit
              </Button>
            )}
            {canDelete && (
              <Button variant="danger" size="md" onClick={deleteModal.open}>
                Delete
              </Button>
            )}
          </div>
        </div>

        {/* Form Error Alert */}
        {actionData?.errors?.form && (
          <Alert variant="error" className="mb-6">
            {actionData.errors.form}
          </Alert>
        )}

        {editMode.isOpen ? (
          // Edit Mode
          <Form method="post" className="space-y-6">
            <input type="hidden" name="intent" value="update" />
            <Card variant="bordered">
              <CardBody className="space-y-4">
                <Input
                  name="contactName"
                  type="text"
                  label="Contact Name"
                  placeholder="e.g., John Smith"
                  required
                  defaultValue={note.contactName}
                  error={actionData?.errors?.contactName}
                  disabled={isSubmitting}
                  autoFocus
                />

                <Input
                  name="contactEmail"
                  type="email"
                  label="Contact Email (optional)"
                  placeholder="e.g., john.smith@example.com"
                  defaultValue={note.contactEmail || ""}
                  error={actionData?.errors?.contactEmail}
                  disabled={isSubmitting}
                />

                <Textarea
                  name="notes"
                  label="Notes"
                  placeholder="Record your conversation details..."
                  rows={8}
                  required
                  defaultValue={note.notes}
                  error={actionData?.errors?.notes}
                  disabled={isSubmitting}
                />
              </CardBody>
            </Card>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={editMode.close}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                Save Changes
              </Button>
            </div>
          </Form>
        ) : (
          // View Mode
          <Card variant="bordered">
            <CardBody className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Name
                </label>
                <p className="text-lg font-semibold text-gray-900">{note.contactName}</p>
              </div>

              {note.contactEmail && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Email
                  </label>
                  <p className="text-gray-900">
                    <a
                      href={`mailto:${note.contactEmail}`}
                      className="text-primary-600 hover:text-primary-700 hover:underline"
                    >
                      {note.contactEmail}
                    </a>
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <p className="text-gray-900 whitespace-pre-wrap">{note.notes}</p>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span className="font-bold">{note.user.name}</span>
                  <div className="flex items-center space-x-2">
                    <span>Created: {new Date(note.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {note.updatedAt !== note.createdAt && (
                      <span>Updated: {new Date(note.updatedAt).toLocaleString()}</span>
                    )}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      <Form method="post">
        <input type="hidden" name="intent" value="delete" />
        <Modal
          isOpen={deleteModal.isOpen}
          onClose={deleteModal.close}
          title="Delete Note"
          size="sm"
          footer={
            <>
              <Button
                type="button"
                variant="outline"
                onClick={deleteModal.close}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="danger"
                isLoading={isSubmitting}
              >
                Delete
              </Button>
            </>
          }
        >
          <p className="text-gray-700">
            Are you sure you want to delete this canvassing note? This action cannot be undone.
          </p>
        </Modal>
      </Form>
    </div>
  );
}
