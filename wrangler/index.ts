import { getDB } from "../db/drizzle";
import { getCorsHeaders } from "./utils/cors";
import {
  handleRegister,
  handleLogin,
  handleLogout,
  handleCreateOrganization,
  handleUserProfile,
  handleOrganizationAdmins,
  handleAddOrganizationAdmin,
  handleRemoveOrganizationAdmin,
  handleRenameOrganization,
  handleTransferSuperadmin,
  handleExitOrganization,
  handleProjectsList,
  handleCreateProject,
  handleProjectDetail,
  handleProjectOverview,
  handleProjectRubrics,
  handleProjectForm,
  handleProjectVideos,
  handleProjectVideoStream,
  handleOrganizationEvaluators,
  handleAssignProjectEvaluator,
  handleProjectFormTestSubmit,
  handleAdminVideosGrouped,
  handleAdminEvaluatorsGrouped,
  handleProjectVideoAssignmentContext,
  handleAssignProjectVideos,
  handleRemoveProjectEvaluator,
  handleEvaluatorProjects,
  handleEvaluatorReviewQueue,
  handleEvaluatorReviewContext,
  handleSaveEvaluatorReview,
  handleOpenAttachment,
} from "./routes";

export default {
  async fetch(req: Request, env: Env) {
    const url = new URL(req.url);
    const db = getDB(env);

    // Handle OPTIONS preflight requests for CORS
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: getCorsHeaders(req, env)
      });
    }

    // Logout
    if (url.pathname === "/api/auth/logout" && req.method === "POST") {
      return handleLogout(req, env, db);
    }

    // Register
    if (url.pathname === "/api/auth/register" && req.method === "POST") {
      return handleRegister(req, env, db);
    }

    // Login
    if (url.pathname === "/api/auth/login" && req.method === "POST") {
      return handleLogin(req, env, db);
    }

    // Organization creation (admin only)
    if (url.pathname === "/api/organization/create" && req.method === "POST") {
      return handleCreateOrganization(req, env, db);
    }

    // User profile (with org info and role)
    if (url.pathname === "/api/user/profile" && req.method === "GET") {
      return handleUserProfile(req, env, db);
    }

    // Organization admin management
    if (url.pathname === "/api/organization/admins" && req.method === "GET") {
      return handleOrganizationAdmins(req, env, db);
    }

    if (url.pathname === "/api/organization/admins/add" && req.method === "POST") {
      return handleAddOrganizationAdmin(req, env, db);
    }

    if (url.pathname === "/api/organization/admins/remove" && req.method === "POST") {
      return handleRemoveOrganizationAdmin(req, env, db);
    }

    if (url.pathname === "/api/organization/rename" && req.method === "POST") {
      return handleRenameOrganization(req, env, db);
    }

    if (url.pathname === "/api/organization/superadmin/transfer" && req.method === "POST") {
      return handleTransferSuperadmin(req, env, db);
    }

    if (url.pathname === "/api/organization/exit" && req.method === "POST") {
      return handleExitOrganization(req, env, db);
    }

    if (url.pathname === "/api/projects" && req.method === "GET") {
      return handleProjectsList(req, env, db);
    }

    if (url.pathname === "/api/projects/create" && req.method === "POST") {
      return handleCreateProject(req, env, db);
    }

    if (url.pathname === "/api/evaluators" && req.method === "GET") {
      return handleOrganizationEvaluators(req, env, db);
    }

    if (url.pathname === "/api/admin/videos" && req.method === "GET") {
      return handleAdminVideosGrouped(req, env, db);
    }

    if (url.pathname === "/api/admin/evaluators" && req.method === "GET") {
      return handleAdminEvaluatorsGrouped(req, env, db);
    }

    if (url.pathname === "/api/evaluator/projects" && req.method === "GET") {
      return handleEvaluatorProjects(req, env, db);
    }

    if (url.pathname === "/api/evaluator/review-queue" && req.method === "GET") {
      return handleEvaluatorReviewQueue(req, env, db);
    }

    const evaluatorReviewContextMatch = url.pathname.match(/^\/api\/evaluator\/review-queue\/(\d+)$/);
    if (evaluatorReviewContextMatch && req.method === "GET") {
      return handleEvaluatorReviewContext(req, env, db, Number(evaluatorReviewContextMatch[1]));
    }

    const evaluatorSaveReviewMatch = url.pathname.match(/^\/api\/evaluator\/review-queue\/(\d+)\/review$/);
    if (evaluatorSaveReviewMatch && req.method === "POST") {
      return handleSaveEvaluatorReview(req, env, db, Number(evaluatorSaveReviewMatch[1]));
    }

    const openAttachmentMatch = url.pathname.match(/^\/api\/attachments\/(\d+)\/open$/);
    if (openAttachmentMatch && req.method === "GET") {
      return handleOpenAttachment(req, env, db, Number(openAttachmentMatch[1]));
    }

    const projectMatch = url.pathname.match(/^\/api\/projects\/(\d+)$/);
    if (projectMatch && req.method === "GET") {
      return handleProjectDetail(req, env, db, Number(projectMatch[1]));
    }

    const projectOverviewMatch = url.pathname.match(/^\/api\/projects\/(\d+)\/overview$/);
    if (projectOverviewMatch && req.method === "GET") {
      return handleProjectOverview(req, env, db, Number(projectOverviewMatch[1]));
    }

    const projectRubricsMatch = url.pathname.match(/^\/api\/projects\/(\d+)\/rubrics$/);
    if (projectRubricsMatch && (req.method === "GET" || req.method === "POST")) {
      return handleProjectRubrics(req, env, db, Number(projectRubricsMatch[1]));
    }

    const projectFormMatch = url.pathname.match(/^\/api\/projects\/(\d+)\/form$/);
    if (projectFormMatch && (req.method === "GET" || req.method === "POST")) {
      return handleProjectForm(req, env, db, Number(projectFormMatch[1]));
    }

    const projectFormTestSubmitMatch = url.pathname.match(/^\/api\/projects\/(\d+)\/form\/test-submit$/);
    if (projectFormTestSubmitMatch && req.method === "POST") {
      return handleProjectFormTestSubmit(req, env, db, Number(projectFormTestSubmitMatch[1]));
    }

    const projectVideosMatch = url.pathname.match(/^\/api\/projects\/(\d+)\/videos$/);
    if (projectVideosMatch && req.method === "GET") {
      return handleProjectVideos(req, env, db, Number(projectVideosMatch[1]));
    }

    const projectVideoAssignmentContextMatch = url.pathname.match(/^\/api\/projects\/(\d+)\/videos\/assignment$/);
    if (projectVideoAssignmentContextMatch && req.method === "GET") {
      return handleProjectVideoAssignmentContext(req, env, db, Number(projectVideoAssignmentContextMatch[1]));
    }

    const projectAssignVideosMatch = url.pathname.match(/^\/api\/projects\/(\d+)\/videos\/assign$/);
    if (projectAssignVideosMatch && req.method === "POST") {
      return handleAssignProjectVideos(req, env, db, Number(projectAssignVideosMatch[1]));
    }

    const projectVideoStreamMatch = url.pathname.match(/^\/api\/projects\/(\d+)\/videos\/(\d+)\/stream$/);
    if (projectVideoStreamMatch && req.method === "GET") {
      return handleProjectVideoStream(
        req,
        env,
        db,
        Number(projectVideoStreamMatch[1]),
        Number(projectVideoStreamMatch[2])
      );
    }

    const projectAssignEvaluatorMatch = url.pathname.match(/^\/api\/projects\/(\d+)\/evaluators\/assign$/);
    if (projectAssignEvaluatorMatch && req.method === "POST") {
      return handleAssignProjectEvaluator(req, env, db, Number(projectAssignEvaluatorMatch[1]));
    }

    const projectRemoveEvaluatorMatch = url.pathname.match(/^\/api\/projects\/(\d+)\/evaluators\/remove$/);
    if (projectRemoveEvaluatorMatch && req.method === "POST") {
      return handleRemoveProjectEvaluator(req, env, db, Number(projectRemoveEvaluatorMatch[1]));
    }

    // Default: Not found
    return new Response("Not found", { status: 404 });
  }
};
