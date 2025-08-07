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

server.start({
  transportType: "stdio",
});