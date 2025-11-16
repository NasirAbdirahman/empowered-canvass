import { Form, Link, useActionData, useLoaderData, redirect } from "react-router";
import { requireUser } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { logout } from "~/utils/session.server";
import { Input, Textarea, Button, Card, CardBody, Alert, Header } from "~/components/ui";
import { validateEmail } from "~/utils/validation";
import { useFormSubmitting } from "~/hooks";

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
  };
  user: {
    id: string;
    email: string;
    name: string;
  };
};

export async function loader({ request, params }: { request: Request; params: { projectId: string } }) {
  const user = await requireUser(request);
  const { projectId } = params;

  if (!projectId) {
    throw new Response("Not Found", { status: 404 });
  }

  // Verify user access
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
    },
  });

  if (!project) {
    throw new Response("Forbidden", { status: 403 });
  }

  return { project, user };
}

export async function action({
  request,
  params,
}: {
  request: Request;
  params: { projectId: string };
}): Promise<Response | ActionData> {
  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  // Handle logout
  if (intent === "logout") {
    return logout(request);
  }

  const user = await requireUser(request);
  const { projectId } = params;

  if (!projectId) {
    throw new Response("Not Found", { status: 404 });
  }

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
    // Verify user still has access to project
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: user.id },
          { members: { some: { userId: user.id } } },
        ],
      },
    });

    if (!project) {
      throw new Response("Forbidden", { status: 403 });
    }

    // Create canvassing note
    const note = await prisma.canvassingNote.create({
      data: {
        projectId,
        userId: user.id,
        contactName: contactName.trim(),
        contactEmail: contactEmail?.trim() || null,
        notes: notes.trim(),
      },
    });

    return redirect(`/projects/${projectId}/notes/${note.id}`);
  } catch (error) {
    console.error("Error creating note:", error);
    return {
      errors: {
        form: "Failed to create note. Please try again.",
      },
    };
  }
}

export default function NewNotePage() {
  const { project, user } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const isSubmitting = useFormSubmitting();

  return (
    <div className="min-h-screen bg-background">
      <Header
        user={user}
        backButton={{ to: `/projects/${project.id}`, tooltip: "Back to Project" }}
      />

      {/* Main Content */}
      <main id="main-content" className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">New Canvassing Note</h1>
          <p className="text-gray-600 mt-2">
            Record details from your canvassing interaction for {project.name}
          </p>
        </div>

        {/* Form Error Alert */}
        {actionData?.errors?.form && (
          <Alert variant="error" className="mb-6">
            {actionData.errors.form}
          </Alert>
        )}

        <Form method="post" className="space-y-6">
          <Card variant="bordered">
            <CardBody className="space-y-4">
              <Input
                name="contactName"
                type="text"
                label="Contact Name"
                placeholder="e.g., John Smith"
                required
                error={actionData?.errors?.contactName}
                disabled={isSubmitting}
                autoFocus
                helperText="Name of the person you spoke with"
              />

              <Input
                name="contactEmail"
                type="email"
                label="Contact Email (optional)"
                placeholder="e.g., john.smith@example.com"
                error={actionData?.errors?.contactEmail}
                disabled={isSubmitting}
                helperText="Email address for follow-up"
              />

              <Textarea
                name="notes"
                label="Notes"
                placeholder="Record your conversation details, contact's concerns, interests, or any relevant information..."
                rows={8}
                required
                error={actionData?.errors?.notes}
                disabled={isSubmitting}
                helperText="Detailed notes from the canvassing interaction"
              />
            </CardBody>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4">
            <Link to={`/projects/${project.id}`}>
              <Button type="button" variant="outline" disabled={isSubmitting}>
                Cancel
              </Button>
            </Link>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Save Note
            </Button>
          </div>
        </Form>
      </main>
    </div>
  );
}
