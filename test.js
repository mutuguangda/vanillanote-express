require('dotenv').config()
const { Client } = require('@notionhq/client');

const notion = new Client({ auth: process.env.NOTION_API_KEY });

(async () => {
  const response = await notion.databases.query({
    database_id: process.env.BLOG_DATABASE_ID
  });
  console.log(response);
})();
