import { FastMCP } from "fastmcp";
import { z } from "zod"; // Or any validation library that supports Standard Schema
import axios from "axios";

const server = new FastMCP({
  name: "My Server",
  version: "1.0.0",
});

server.addTool({
  name: "add",
  description: "Add two numbers",
  parameters: z.object({
    a: z.number(),
    b: z.number(),
  }),
  execute: async (args) => {
    return String(args.a + args.b + 10);
  },
});

server.addTool({
    name: "address",
    description: "Search Japanese address by postal code",
    parameters: z.object({
      zipcode: z.string().length(7).regex(/^\d+$/), // 7桁の数字文字列
    }),
    execute: async ({ zipcode }) => {
      try {
        const response = await axios.get("https://zipcloud.ibsnet.co.jp/api/search", {
          params: { zipcode },
        });
  
        const result = response.data;
        if (result.status !== 200 || !result.results || result.results.length === 0) {
          return `住所が見つかりませんでした（status: ${result.status}）`;
        }
  
        const address = result.results[0];
        return `${address.address1}${address.address2}${address.address3}`;
      } catch (error) {
        return `住所検索中にエラーが発生しました: ${error}`;
      }
    },
  });

// GitHub API configuration
const GITHUB_TOKEN = ""; // GitHubアクセストークンを設定
const GITHUB_OWNER = ""; // リポジトリオーナーを設定

// GitHub API Tools

server.addTool({
  name: "github_get_pull_requests",
  description: "Get pull requests from a GitHub repository",
  parameters: z.object({
    repo: z.string().describe("Repository name"),
    state: z.enum(["open", "closed", "all"]).default("open").describe("State of pull requests to retrieve"),
    per_page: z.number().min(1).max(100).default(30).describe("Number of results per page"),
    page: z.number().min(1).default(1).describe("Page number"),
  }),
  execute: async ({ repo, state, per_page, page }) => {
    try {
      const response = await axios.get(`https://api.github.com/repos/${GITHUB_OWNER}/${repo}/pulls`, {
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
        },
        params: {
          state,
          per_page,
          page,
        },
      });

      const pulls = response.data.map((pr: any) => ({
        number: pr.number,
        title: pr.title,
        state: pr.state,
        user: pr.user.login,
        created_at: pr.created_at,
        updated_at: pr.updated_at,
        html_url: pr.html_url,
        head: {
          ref: pr.head.ref,
          sha: pr.head.sha,
        },
        base: {
          ref: pr.base.ref,
          sha: pr.base.sha,
        },
        mergeable: pr.mergeable,
        merged: pr.merged,
      }));

      return JSON.stringify(pulls, null, 2);
    } catch (error: any) {
      return `プルリクエストの取得中にエラーが発生しました: ${error.response?.data?.message || error.message}`;
    }
  },
});

server.addTool({
  name: "github_add_comment",
  description: "Add a comment to a GitHub pull request",
  parameters: z.object({
    repo: z.string().describe("Repository name"),
    pull_number: z.number().describe("Pull request number"),
    body: z.string().describe("Comment body (supports Markdown)"),
  }),
  execute: async ({ repo, pull_number, body }) => {
    try {
      const response = await axios.post(
        `https://api.github.com/repos/${GITHUB_OWNER}/${repo}/issues/${pull_number}/comments`,
        { body },
        {
          headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
          },
        }
      );

      return `コメントが正常に追加されました。コメントID: ${response.data.id}, URL: ${response.data.html_url}`;
    } catch (error: any) {
      return `コメントの追加中にエラーが発生しました: ${error.response?.data?.message || error.message}`;
    }
  },
});

server.addTool({
  name: "github_get_pull_diff",
  description: "Get the diff of a GitHub pull request",
  parameters: z.object({
    repo: z.string().describe("Repository name"),
    pull_number: z.number().describe("Pull request number"),
    format: z.enum(["diff", "patch"]).default("diff").describe("Format of the diff (diff or patch)"),
  }),
  execute: async ({ repo, pull_number, format }) => {
    try {
      const acceptHeader = format === "patch" 
        ? "application/vnd.github.v3.patch"
        : "application/vnd.github.v3.diff";

      const response = await axios.get(
        `https://api.github.com/repos/${GITHUB_OWNER}/${repo}/pulls/${pull_number}`,
        {
          headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Accept': acceptHeader,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      return `差分の取得中にエラーが発生しました: ${error.response?.data?.message || error.message}`;
    }
  },
});

server.addTool({
  name: "github_get_pull_files",
  description: "Get the list of files changed in a GitHub pull request",
  parameters: z.object({
    repo: z.string().describe("Repository name"),
    pull_number: z.number().describe("Pull request number"),
    per_page: z.number().min(1).max(100).default(30).describe("Number of results per page"),
    page: z.number().min(1).default(1).describe("Page number"),
  }),
  execute: async ({ repo, pull_number, per_page, page }) => {
    try {
      const response = await axios.get(
        `https://api.github.com/repos/${GITHUB_OWNER}/${repo}/pulls/${pull_number}/files`,
        {
          headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
          },
          params: {
            per_page,
            page,
          },
        }
      );

      const files = response.data.map((file: any) => ({
        filename: file.filename,
        status: file.status,
        additions: file.additions,
        deletions: file.deletions,
        changes: file.changes,
        blob_url: file.blob_url,
        patch: file.patch, // 差分の内容
      }));

      return JSON.stringify(files, null, 2);
    } catch (error: any) {
      return `ファイル一覧の取得中にエラーが発生しました: ${error.response?.data?.message || error.message}`;
    }
  },
});

server.addTool({
  name: "github_get_pull_reviews",
  description: "Get reviews for a GitHub pull request",
  parameters: z.object({
    repo: z.string().describe("Repository name"),
    pull_number: z.number().describe("Pull request number"),
    per_page: z.number().min(1).max(100).default(30).describe("Number of results per page"),
    page: z.number().min(1).default(1).describe("Page number"),
  }),
  execute: async ({ repo, pull_number, per_page, page }) => {
    try {
      const response = await axios.get(
        `https://api.github.com/repos/${GITHUB_OWNER}/${repo}/pulls/${pull_number}/reviews`,
        {
          headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
          },
          params: {
            per_page,
            page,
          },
        }
      );

      const reviews = response.data.map((review: any) => ({
        id: review.id,
        user: review.user.login,
        state: review.state,
        body: review.body,
        submitted_at: review.submitted_at,
        html_url: review.html_url,
      }));

      return JSON.stringify(reviews, null, 2);
    } catch (error: any) {
      return `レビューの取得中にエラーが発生しました: ${error.response?.data?.message || error.message}`;
    }
  },
});

server.start({
  transportType: "stdio",
});