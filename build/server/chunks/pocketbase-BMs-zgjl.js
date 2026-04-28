import PocketBase from 'pocketbase';

const POCKETBASE_URL = "http://localhost:8090";
const pb = new PocketBase(POCKETBASE_URL);
function isAuthenticated() {
  return pb.authStore.isValid;
}
function getCurrentUser() {
  return pb.authStore.model;
}

export { getCurrentUser as g, isAuthenticated as i };
//# sourceMappingURL=pocketbase-BMs-zgjl.js.map
