const express = require("express");
const articleCtrl = require("../controller/article");
const auth = require("../middleware/auth");
const articleValidator = require("../validator/article");

const router = express.Router();

// List Articles
router.get("/articles", articleCtrl.listArticles);

// Feed Articles
router.get("/feed", auth, articleCtrl.feedArticles);

// Init Articles
router.get("/init", auth, articleCtrl.initArticles);

// Get Article
router.get("/:articleId",  articleCtrl.getArticle);


// Create Article 创建文章
router.post(
  "/",
  auth,
  articleValidator.createArticle,
  articleCtrl.createArticle
);

// Update Article
router.put(
  "/:articleId",
  auth,
  articleValidator.updateArticle,
  articleCtrl.updateArticle
);

// Delete Article
router.delete(
  "/:articleId",
  auth,
  articleValidator.deleteArticle,
  articleCtrl.deleteArticle
);

// Add Comments to an Article
router.post("/:articleId/comments", auth, articleCtrl.addComments);

// Get Comments from an Article
router.get("/:articleId/comments", articleCtrl.getComments);

// Delete Comment
router.delete("/:articleId/comments/:id", auth, articleCtrl.deleteComment);

// Favorite Article
router.post("/:articleId/favorite", auth, articleCtrl.favoriteArticle);

// Unfavorite Article
router.delete("/:articleId/favorite", auth, articleCtrl.unfavoriteArticle);

module.exports = router;
