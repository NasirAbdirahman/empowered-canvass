import { requireUser } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";

export async function loader({
  request,
  params,
}: {
  request: Request;
  params: { projectId: string };
}) {
  const user = await requireUser(request);
  const { projectId } = params;

  if (!projectId) {
    throw new Response("Not Found", { status: 404 });
  }

  // Verify user has access to the project
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      OR: [
        { ownerId: user.id },
        { members: { some: { userId: user.id } } },
      ],
    },
    include: {
      notes: {
        include: {
          user: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!project) {
    throw new Response("Forbidden", { status: 403 });
  }

  // Generate CSV content
  const csvRows = [];

  // CSV Header
  csvRows.push([
    "Contact Name",
    "Contact Email",
    "Notes",
    "Created By",
    "Created Date",
    "Updated Date"
  ].join(","));

  // CSV Data rows
  for (const note of project.notes) {
    const row = [
      `"${note.contactName.replace(/"/g, '""')}"`,
      note.contactEmail ? `"${note.contactEmail.replace(/"/g, '""')}"` : "",
      `"${note.notes.replace(/"/g, '""').replace(/\n/g, " ")}"`,
      `"${note.user.name.replace(/"/g, '""')}"`,
      new Date(note.createdAt).toLocaleDateString(),
      new Date(note.updatedAt).toLocaleDateString()
    ];
    csvRows.push(row.join(","));
  }

  const csvContent = csvRows.join("\n");
  const fileName = `${project.name.replace(/[^a-z0-9]/gi, '_')}_notes_${new Date().toISOString().split('T')[0]}.csv`;

  // Return CSV file as download
  return new Response(csvContent, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
