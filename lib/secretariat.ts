import { db } from "@/lib/db";
import { appendAuditLog } from "@/lib/audit";
import type { OfficeSlug } from "@/lib/admin-auth";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

export type DocumentPermission = "PUBLIC" | "MEMBERS" | "EXECUTIVES" | "OFFICE_ONLY" | "GENSEC_ONLY";

export async function listOfficeDocuments(office: OfficeSlug, actingFor?: OfficeSlug) {
  const documents = await db.officeDocument.findMany({
    include: { versions: { orderBy: { version: "desc" } } },
    orderBy: { updatedAt: "desc" },
    take: 200,
  });
  return documents.filter((document) => {
    const authority = actingFor ?? office;
    if (document.permission === "GENSEC_ONLY") return authority === "general-secretary";
    if (document.permission === "OFFICE_ONLY") return document.createdBy === office || authority === "general-secretary";
    return ["PUBLIC", "MEMBERS", "EXECUTIVES"].includes(document.permission);
  });
}

export async function createOfficeDocument(input: {
  title: string;
  description: string;
  folder: string;
  session: string;
  permission: DocumentPermission;
  tags: string[];
  driveLink: string | null;
  filePath: string | null;
  createdBy: OfficeSlug;
}) {
  return db.$transaction(async (tx) => {
    const document = await tx.officeDocument.create({
      data: {
        ...input,
        tags: JSON.stringify(input.tags),
        versions: { create: { version: 1, filePath: input.filePath, driveLink: input.driveLink, createdBy: input.createdBy } },
      },
      include: { versions: true },
    });
    await appendAuditLog({
      action: "OFFICE_DOCUMENT_CREATED",
      office: input.createdBy,
      entityType: "OfficeDocument",
      entityId: document.id,
      details: { title: document.title, permission: document.permission },
      occurredAt: new Date().toISOString(),
    }, tx);
    return document;
  });
}

export async function addOfficeDocumentVersion(input: {
  documentId: string;
  office: OfficeSlug;
  actingFor?: OfficeSlug;
  filePath: string | null;
  driveLink: string | null;
}) {
  return db.$transaction(async (tx) => {
    const document = await tx.officeDocument.findUnique({
      where: { id: input.documentId },
      include: { versions: { orderBy: { version: "desc" }, take: 1 } },
    });
    if (!document) throw new Error("Document not found");
    if (input.office !== "general-secretary" && input.actingFor !== "general-secretary" && document.createdBy !== input.office) {
      throw new Error("Only the document owner office or General Secretary may add versions");
    }
    const version = (document.versions[0]?.version ?? 0) + 1;
    const record = await tx.officeDocumentVersion.create({
      data: {
        documentId: document.id,
        version,
        filePath: input.filePath,
        driveLink: input.driveLink,
        createdBy: input.office,
      },
    });
    await tx.officeDocument.update({
      where: { id: document.id },
      data: { filePath: input.filePath, driveLink: input.driveLink },
    });
    await appendAuditLog({
      action: "OFFICE_DOCUMENT_VERSION_ADDED",
      office: input.office,
      entityType: "OfficeDocument",
      entityId: document.id,
      details: { version },
      occurredAt: new Date().toISOString(),
    }, tx);
    return record;
  });
}

export async function createOfficialLetter(input: {
  recipient: string;
  subject: string;
  body: string;
  createdBy: OfficeSlug;
}) {
  const year = new Date().getFullYear();
  return db.$transaction(async (tx) => {
    const sequence = await tx.letterSequence.upsert({
      where: { year },
      create: { year, nextValue: 2 },
      update: { nextValue: { increment: 1 } },
    });
    const reservedNumber = sequence.nextValue - 1;
    const reference = `NACOSS/GS/${year}/${String(reservedNumber).padStart(3, "0")}`;
    const letter = await tx.officialLetter.create({
      data: { ...input, reference },
    });
    await appendAuditLog({
      action: "OFFICIAL_LETTER_DRAFTED",
      office: input.createdBy,
      entityType: "OfficialLetter",
      entityId: letter.id,
      details: { reference, subject: letter.subject },
      occurredAt: new Date().toISOString(),
    }, tx);
    return letter;
  });
}

export async function listOfficialLetters(office: OfficeSlug, actingFor?: OfficeSlug) {
  return db.officialLetter.findMany({
    where: office === "general-secretary" || actingFor === "general-secretary" ? undefined : { createdBy: office },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export async function submitOfficialLetter(id: string, office: OfficeSlug) {
  return db.$transaction(async (tx) => {
    const letter = await tx.officialLetter.findUnique({ where: { id } });
    if (!letter || letter.createdBy !== office) throw new Error("Letter not found for this office");
    if (letter.status !== "DRAFT") throw new Error("Only draft letters can be submitted");
    const updated = await tx.officialLetter.update({ where: { id }, data: { status: "PENDING" } });
    await appendAuditLog({
      action: "OFFICIAL_LETTER_SUBMITTED",
      office,
      entityType: "OfficialLetter",
      entityId: id,
      details: { reference: letter.reference },
      occurredAt: new Date().toISOString(),
    }, tx);
    return updated;
  });
}

export async function returnOfficialLetterToDraft(id: string, office: OfficeSlug) {
  return db.$transaction(async (tx) => {
    const result = await tx.officialLetter.updateMany({
      where: { id, createdBy: office, status: "PENDING" },
      data: { status: "DRAFT" },
    });
    if (result.count) await appendAuditLog({
      action: "OFFICIAL_LETTER_SUBMISSION_ROLLED_BACK",
      office,
      entityType: "OfficialLetter",
      entityId: id,
      occurredAt: new Date().toISOString(),
    }, tx);
    return result.count;
  });
}

export async function saveOfficeDocumentUpload(file: File): Promise<string> {
  const extension = path.extname(file.name).toLowerCase();
  if (![".pdf", ".doc", ".docx", ".txt", ".png", ".jpg", ".jpeg"].includes(extension)) {
    throw new Error("Unsupported file type");
  }
  if (file.size < 1 || file.size > 10 * 1024 * 1024) throw new Error("File must be between 1 byte and 10 MB");
  const directory = path.join(process.cwd(), "storage", "office-documents");
  await mkdir(directory, { recursive: true });
  const filename = `${randomUUID()}${extension}`;
  await writeFile(path.join(directory, filename), Buffer.from(await file.arrayBuffer()), { flag: "wx" });
  return `/storage/office-documents/${filename}`;
}

export async function removeOfficeDocumentUpload(filePath: string) {
  const prefix = "/storage/office-documents/";
  const filename = filePath.startsWith(prefix) ? filePath.slice(prefix.length) : "";
  if (!filename || path.basename(filename) !== filename) throw new Error("Invalid document storage path");
  await unlink(path.join(process.cwd(), "storage", "office-documents", filename));
}

export async function listOversightQueries(office: OfficeSlug) {
  return db.oversightQuery.findMany({
    where: office === "general-secretary" ? undefined : { targetOffice: office },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export async function createOversightQuery(input: {
  targetOffice: OfficeSlug;
  createdBy: OfficeSlug;
  kind: string;
  subject: string;
  message: string;
}) {
  return db.$transaction(async (tx) => {
    const query = await tx.oversightQuery.create({ data: input });
    await tx.notification.create({
      data: {
        office: input.targetOffice,
        title: input.kind === "REMINDER" ? "Secretariat reminder" : "Formal query from the Secretariat",
        message: input.subject,
        link: "/office/oversight",
        kind: "OVERSIGHT",
      },
    });
    await appendAuditLog({
      action: "OVERSIGHT_QUERY_SENT",
      office: input.createdBy,
      entityType: "OversightQuery",
      entityId: query.id,
      details: { targetOffice: input.targetOffice, kind: input.kind, subject: input.subject },
      occurredAt: new Date().toISOString(),
    }, tx);
    return query;
  });
}

export async function respondToOversightQuery(input: {
  id: string;
  office: OfficeSlug;
  response: string;
}) {
  return db.$transaction(async (tx) => {
    const query = await tx.oversightQuery.findUnique({ where: { id: input.id } });
    if (!query || query.targetOffice !== input.office) throw new Error("Query not found for this office");
    if (query.status !== "OPEN") throw new Error("Query has already been answered");
    const updated = await tx.oversightQuery.update({
      where: { id: query.id },
      data: { response: input.response, responseAt: new Date(), status: "ANSWERED" },
    });
    await appendAuditLog({
      action: "OVERSIGHT_QUERY_ANSWERED",
      office: input.office,
      entityType: "OversightQuery",
      entityId: query.id,
      occurredAt: new Date().toISOString(),
    }, tx);
    return updated;
  });
}

export async function getSecretariatConcerns() {
  return db.concern.findMany({
    select: {
      id: true,
      category: true,
      subject: true,
      message: true,
      isAnonymous: true,
      targetOfficeSlug: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 300,
  });
}

export async function reassignSecretariatConcern(input: {
  concernId: string;
  targetOffice: OfficeSlug;
  actorOffice: OfficeSlug;
}) {
  return db.$transaction(async (tx) => {
    const concern = await tx.concern.findUnique({
      where: { id: input.concernId },
      select: { id: true, targetOfficeSlug: true, isAnonymous: true, subject: true },
    });
    if (!concern) throw new Error("Concern not found");
    const previousOffice = concern.targetOfficeSlug;
    const updated = await tx.concern.update({
      where: { id: concern.id },
      data: { targetOfficeSlug: input.targetOffice },
    });
    await tx.concernUpdate.create({
      data: {
        concernId: concern.id,
        status: updated.status,
        note: `Reassigned by the General Secretary from ${previousOffice} to ${input.targetOffice}.`,
      },
    });
    await tx.notification.create({
      data: {
        office: input.targetOffice,
        title: "Concern reassigned",
        message: concern.subject,
        link: "/office/concerns",
        kind: "CONCERN",
      },
    });
    await appendAuditLog({
      action: "CONCERN_REASSIGNED",
      office: input.actorOffice,
      entityType: "Concern",
      entityId: concern.id,
      details: { previousOffice, targetOffice: input.targetOffice, isAnonymous: concern.isAnonymous },
      occurredAt: new Date().toISOString(),
    }, tx);
    return updated;
  });
}

export async function saveScorecardPromise(input: {
  id?: string;
  title: string;
  description: string;
  baseline: string | null;
  target: string | null;
  delivered: string | null;
  isPublished: boolean;
  updatedBy: OfficeSlug;
}) {
  return db.$transaction(async (tx) => {
    const promise = input.id
      ? await tx.scorecardPromise.update({
          where: { id: input.id },
          data: {
            title: input.title, description: input.description, baseline: input.baseline,
            target: input.target, delivered: input.delivered, isPublished: input.isPublished,
            updatedBy: input.updatedBy,
          },
        })
      : await tx.scorecardPromise.create({ data: input });
    await appendAuditLog({
      action: input.isPublished ? "SCORECARD_PROMISE_PUBLISHED" : "SCORECARD_PROMISE_SAVED",
      office: input.updatedBy,
      entityType: "ScorecardPromise",
      entityId: promise.id,
      details: { title: promise.title, isPublished: promise.isPublished },
      occurredAt: new Date().toISOString(),
    }, tx);
    return promise;
  });
}

export async function getScorecardPromises(publishedOnly = false) {
  return db.scorecardPromise.findMany({
    where: publishedOnly ? { isPublished: true } : undefined,
    orderBy: { updatedAt: "desc" },
    take: 100,
  });
}

export async function getSiwesModerationQueue() {
  const [placements, alumni, removals] = await Promise.all([
    db.siwesPlacement.findMany({ where: { isApproved: false }, orderBy: { createdAt: "asc" }, take: 200 }),
    db.alumnus.findMany({ where: { isApproved: false }, orderBy: { createdAt: "asc" }, take: 200 }),
    db.removalRequest.findMany({ orderBy: { createdAt: "asc" }, take: 200 }),
  ]);
  return { placements, alumni, removals };
}

export async function getExecutiveDirectory() {
  return db.executive.findMany({ orderBy: { position: "asc" } });
}

export async function updateExecutiveDirectory(input: {
  officeSlug: string;
  name: string;
  officeEmail: string;
  isListed: boolean;
  emailConsent: boolean;
  photoUrl: string | null;
  updatedBy: OfficeSlug;
}) {
  return db.$transaction(async (tx) => {
    const current = await tx.executive.findUnique({ where: { officeSlug: input.officeSlug } });
    if (!current) throw new Error("Executive directory entry not found");
    if (
      input.name !== current.name &&
      input.name !== "Name to be confirmed" &&
      !/^Test Executive [A-Z0-9]+$/.test(input.name)
    ) throw new Error("Use a placeholder name; real personal data is not allowed in this prototype");
    const testEmailForOffice: Partial<Record<string, string>> = {
      "general-secretary": "sanayodeji087@gmail.com",
      pro: "sanusifatih04@gmail.com",
    };
    if (
      input.officeEmail !== current.officeEmail &&
      !input.officeEmail.endsWith("@nacoss-unilag.example") &&
      testEmailForOffice[input.officeSlug] !== input.officeEmail
    ) throw new Error("Only placeholder addresses and approved test addresses are allowed");
    if (input.photoUrl && (!input.photoUrl.startsWith("/") || input.photoUrl.includes("..") || input.photoUrl.includes("\\"))) {
      throw new Error("Photo must use a safe local public path");
    }
    const executive = await tx.executive.update({
      where: { officeSlug: input.officeSlug },
      data: {
        name: input.name,
        officeEmail: input.officeEmail,
        isListed: input.isListed,
        emailConsent: input.emailConsent,
        photoUrl: input.photoUrl,
      },
    });
    await appendAuditLog({
      action: "EXECUTIVE_DIRECTORY_UPDATED",
      office: input.updatedBy,
      entityType: "Executive",
      entityId: executive.id,
      details: { officeSlug: executive.officeSlug, changed: ["name", "officeEmail", "isListed", "emailConsent", "photoUrl"] },
      occurredAt: new Date().toISOString(),
    }, tx);
    return executive;
  });
}

export async function getHandoverPackData() {
  const [meetings, minutes, tasks, reports, letters, digests] = await Promise.all([
    db.meeting.findMany({ orderBy: { date: "desc" }, take: 250 }),
    db.meetingMinutes.findMany({ orderBy: { updatedAt: "desc" }, take: 250 }),
    db.task.findMany({ orderBy: { createdAt: "desc" }, take: 500 }),
    db.executiveReport.findMany({ orderBy: { submittedAt: "desc" }, take: 250 }),
    db.officialLetter.findMany({ orderBy: { createdAt: "desc" }, take: 250 }),
    db.decisionDigest.findMany({ orderBy: { publishedAt: "desc" }, take: 250 }),
  ]);
  return { generatedAt: new Date(), meetings, minutes, tasks, reports, letters, digests };
}
