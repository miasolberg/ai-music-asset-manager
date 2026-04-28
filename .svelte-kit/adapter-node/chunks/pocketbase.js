import PocketBase from "pocketbase";
const POCKETBASE_URL = "http://192.168.178.5:8090";
const pb = new PocketBase(POCKETBASE_URL);
function isAuthenticated() {
  return pb.authStore.isValid;
}
function getCurrentUser() {
  return pb.authStore.model;
}
export {
  getCurrentUser as g,
  isAuthenticated as i
};
