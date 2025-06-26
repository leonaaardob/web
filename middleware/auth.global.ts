import { useAuthStore } from "~/stores/AuthStore";
import alertStore from "~/stores/AlertStore";
import { AlertStatuses } from "~/constants/AlertStatuses";

export default defineNuxtRouteMiddleware(async (to, from) => {
  if (process.server) return;

  if (to.query.error) {
    const errorMessage = Array.isArray(to.query.error) 
      ? to.query.error[0] 
      : to.query.error;
    
    if (typeof errorMessage === 'string') {
      alertStore().add({
        duration: 5000,
        severity: AlertStatuses.Error,
        title: "Error",
        message: errorMessage,
      });
    }

    // Remove error from URL to prevent showing toast again on refresh
    const query = { ...to.query };
    delete query.error;
  }

  let hasMe: boolean = useAuthStore().me?.steam_id ? true : false;

  if (!hasMe) {
    hasMe = await useAuthStore().getMe();
  }

  if (!hasMe && to.path !== "/login") {
    return navigateTo(
      `/login${to.path === "/" ? "" : `?redirect=${to.path}`}`,
    );
  }

  if (hasMe && to.path === "/login") {
    if (to.query.redirect) {
      return navigateTo(decodeURIComponent(to.query.redirect as string));
    }
    return navigateTo("/");
  }
});
