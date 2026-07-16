import { enforceUsername } from "../actions/auth";
import BoardClient from "./board-client";

export default async function BoardPage() {
  await enforceUsername();
  return <BoardClient />;
}
