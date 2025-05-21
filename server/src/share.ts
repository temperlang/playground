import type { BuildRequest } from "./watch.js";

const githubToken = process.env.TEMPER_PLAY_GITHUB;
if (!githubToken) throw new Error("TEMPER_PLAY_GITHUB env var missing");

export type ShareResponse = {
  id: string;
};

export const share = async (request: BuildRequest): Promise<ShareResponse> => {
  console.log("share");
  const response = await fetch("https://api.github.com/gists", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${githubToken}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "temper-playground",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify({
      description: "Code shared from the Temper Playground",
      public: true,
      files: {
        "playground.temper": { content: request.source },
      },
    }),
  });
  const data = await response.json();
  // console.log(data);
  if (!response.ok) {
    throw new Error(JSON.stringify({ status: response.statusText, data }));
  }
  const info = data as CreateGistOk;
  // TODO Include link back to Temper Playground with id once public?
  // TODO We need the id first, so start that async here but don't await it.
  return { id: info.id };
};

type CreateGistOk = {
  id: string;
  url: string;
  // ... lots more could go here ...
};
