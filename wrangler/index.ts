import { getDB } from "../db/drizzle";
import { getCorsHeaders } from "./utils/cors";
import {
  handleRegister,
  handleLogin,
  handleLogout,
  handleForgotPassword,
  handleResetPassword,
  handleCreateOrganization,
  handleUserProfile,
  handleUpdateUserProfile,
  handleChangePassword,
  handleOrganizationAdmins,
  handleAddOrganizationAdmin,
  handleRemoveOrganizationAdmin,
  handleRenameOrganization,
  handleTransferSuperadmin,
  handleExitOrganization,
  handleOrganizationUsers,
  handleUpdateUserRole,
  handleDeleteUser,
  handleProjectsList,
  handleCreateProject,
  handleProjectDetail,
  handleUpdateProject,
  handleDeleteProject,
  handleProjectOverview,
  handleProjectRubrics,
  handleUpdateProjectRubric,
  handleDeleteProjectRubric,
  handleProjectForm,
  handleProjectFormField,
  handleAddProjectFormField,
  handleProjectVideos,
  handleProjectVideoStream,
  handleOrganizationEvaluators,
  handleAssignProjectEvaluator,
  handleProjectFormTestSubmit,
  handleAdminVideosGrouped,
  handleAdminEvaluatorsGrouped,
  handleProjectVideoAssignmentContext,
  handleAssignProjectVideos,
  handleUnassignVideos,
  handleRemoveProjectEvaluator,
  handleEvaluatorProjects,
  handleEvaluatorReviewQueue,
  handleEvaluatorReviewContext,
  handleSaveEvaluatorReview,
  handleOpenAttachment,
  handleShareFormWithSubmitters,
  handleGetFormShares,
  handleSubmitterApplications,
  handleSubmitterGetForm,
  handleSubmitterSubmitForm,
  handleSubmitterExplore,
} from "./routes";
import { handleAiAnalyzeVideo, handleAiChat, handleAiStatus } from "./routes-ai";

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

    // Forgot password
    if (url.pathname === "/api/auth/forgot-password" && req.method === "POST") {
      return handleForgotPassword(req, env, db);
    }

    // Reset password
    if (url.pathname === "/api/auth/reset-password" && req.method === "POST") {
      return handleResetPassword(req, env, db);
    }

    // Organization creation (admin only)
    if (url.pathname === "/api/organization/create" && req.method === "POST") {
      return handleCreateOrganization(req, env, db);
    }

    // User profile (with org info and role)
    if (url.pathname === "/api/user/profile" && req.method === "GET") {
      return handleUserProfile(req, env, db);
    }
    if (url.pathname === "/api/user/profile" && req.method === "POST") {
      return handleUpdateUserProfile(req, env, db);
    }

    // Change password
    if (url.pathname === "/api/user/change-password" && req.method === "POST") {
      return handleChangePassword(req, env, db);
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

    if (url.pathname === "/api/organization/users" && req.method === "GET") {
      return handleOrganizationUsers(req, env, db);
    }

    const orgUserRoleMatch = url.pathname.match(/^\/api\/organization\/users\/(\d+)\/role$/);
    if (orgUserRoleMatch && req.method === "PATCH") {
      return handleUpdateUserRole(req, env, db, Number(orgUserRoleMatch[1]));
    }

    const orgUserDeleteMatch = url.pathname.match(/^\/api\/organization\/users\/(\d+)$/);
    if (orgUserDeleteMatch && req.method === "DELETE") {
      return handleDeleteUser(req, env, db, Number(orgUserDeleteMatch[1]));
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
    if (projectMatch) {
      const id = Number(projectMatch[1]);
      if (req.method === "GET") return handleProjectDetail(req, env, db, id);
      if (req.method === "PATCH") return handleUpdateProject(req, env, db, id);
      if (req.method === "DELETE") return handleDeleteProject(req, env, db, id);
    }

    const projectOverviewMatch = url.pathname.match(/^\/api\/projects\/(\d+)\/overview$/);
    if (projectOverviewMatch && req.method === "GET") {
      return handleProjectOverview(req, env, db, Number(projectOverviewMatch[1]));
    }

    const projectRubricsMatch = url.pathname.match(/^\/api\/projects\/(\d+)\/rubrics$/);
    if (projectRubricsMatch && (req.method === "GET" || req.method === "POST")) {
      return handleProjectRubrics(req, env, db, Number(projectRubricsMatch[1]));
    }

    const singleRubricMatch = url.pathname.match(/^\/api\/projects\/(\d+)\/rubrics\/(\d+)$/);
    if (singleRubricMatch) {
      const pid = Number(singleRubricMatch[1]);
      const rid = Number(singleRubricMatch[2]);
      if (req.method === "PATCH") return handleUpdateProjectRubric(req, env, db, pid, rid);
      if (req.method === "DELETE") return handleDeleteProjectRubric(req, env, db, pid, rid);
    }

    const projectFormMatch = url.pathname.match(/^\/api\/projects\/(\d+)\/form$/);
    if (projectFormMatch && (req.method === "GET" || req.method === "POST")) {
      return handleProjectForm(req, env, db, Number(projectFormMatch[1]));
    }

    const formFieldMatch = url.pathname.match(/^\/api\/projects\/(\d+)\/form\/fields\/(\d+)$/);
    if (formFieldMatch) {
      const pid = Number(formFieldMatch[1]);
      const idx = Number(formFieldMatch[2]);
      if (req.method === "PATCH" || req.method === "DELETE") {
        return handleProjectFormField(req, env, db, pid, idx);
      }
    }

    const addFormFieldMatch = url.pathname.match(/^\/api\/projects\/(\d+)\/form\/fields$/);
    if (addFormFieldMatch && req.method === "POST") {
      return handleAddProjectFormField(req, env, db, Number(addFormFieldMatch[1]));
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

    const projectUnassignVideosMatch = url.pathname.match(/^\/api\/projects\/(\d+)\/videos\/unassign$/);
    if (projectUnassignVideosMatch && req.method === "POST") {
      return handleUnassignVideos(req, env, db, Number(projectUnassignVideosMatch[1]));
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

    // Submitter: list applications (shared forms)
    if (url.pathname === "/api/submitter/applications" && req.method === "GET") {
      return handleSubmitterApplications(req, env, db);
    }

    // Submitter: explore live programs
    if (url.pathname === "/api/submitter/explore" && req.method === "GET") {
      return handleSubmitterExplore(req, env, db);
    }

    const submitterGetFormMatch = url.pathname.match(/^\/api\/submitter\/projects\/(\d+)\/form$/);
    if (submitterGetFormMatch && req.method === "GET") {
      return handleSubmitterGetForm(req, env, db, Number(submitterGetFormMatch[1]));
    }

    const submitterSubmitMatch = url.pathname.match(/^\/api\/submitter\/projects\/(\d+)\/submit$/);
    if (submitterSubmitMatch && req.method === "POST") {
      return handleSubmitterSubmitForm(req, env, db, Number(submitterSubmitMatch[1]));
    }

    const shareFormMatch = url.pathname.match(/^\/api\/projects\/(\d+)\/share$/);
    if (shareFormMatch && req.method === "POST") {
      return handleShareFormWithSubmitters(req, env, db, Number(shareFormMatch[1]));
    }

    const getFormSharesMatch = url.pathname.match(/^\/api\/projects\/(\d+)\/shares$/);
    if (getFormSharesMatch && req.method === "GET") {
      return handleGetFormShares(req, env, db, Number(getFormSharesMatch[1]));
    }

    // AI endpoints
    if (url.pathname === "/api/ai/analyze-video" && req.method === "POST") {
      return handleAiAnalyzeVideo(req, env, db);
    }

    if (url.pathname === "/api/ai/chat" && req.method === "POST") {
      return handleAiChat(req, env, db);
    }

    const aiStatusMatch = url.pathname.match(/^\/api\/ai\/status\/(\d+)$/);
    if (aiStatusMatch && req.method === "GET") {
      return handleAiStatus(req, env, db, Number(aiStatusMatch[1]));
    }

    // Default: Not found
    return new Response("Not found", { status: 404 });
  }
};
