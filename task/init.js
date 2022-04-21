// const { Article, User, Tag, Topic, Comment } = require("../model")
const notion = require('../util/notion')

const articleDatabaseId = 'd8b194ad880e4e13b1a5f4cb6e0ba9b2'

;(async () => {
  const response = await notion.databases.query({
    database_id: articleDatabaseId,
    filter: {
      property: 'isPublished',
      checkbox: {
        equals: true,
      },
    },
    sorts: [
      {
        property: 'publishedTime',
        direction: 'descending',
      },
    ],
  });
  console.log(response);
})()