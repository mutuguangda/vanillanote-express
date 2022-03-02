require('dotenv').config()
const { Client } = require('@notionhq/client');

const notion = new Client({ auth: process.env.NOTION_API_KEY });

(async () => {
  const response = await notion.databases.query({
    database_id: process.env.BLOG_DATABASE_ID,
    filter: {
      property: 'id',
      "rich_text": {
        "contains": "7bf37f9b-0808-42c9-a000-a5f04f5487c2"
      }
    },
  });
  console.log(response);
})();
