const express = require('express')
const verifyToken = require('../middleware/verify-token.js')
const Recipe = require('../models/recipe.js')
const router = express.Router()


router.post("/", verifyToken, async (req, res) => {
    try {
        if (!req.body) {
            return res.status(400).json({ err: "Request body is required" });
        }

        const recipeData = {
            ...req.body,
            author: req.user._id
        };

        const recipe = await Recipe.create(recipeData);
        await recipe.populate('author', 'username');
        
        res.status(201).json(recipe);
    } catch (error) {
        console.error('Recipe creation error:', error);
        res.status(500).json({ err: error.message });
    }
});

router.get("/", verifyToken, async (req, res) => {
    try {
        const hoots = await Recipe.find({})
          .populate("author")
          .sort({ createdAt: "desc" });
        res.status(200).json(hoots);
      } catch (error) {
        res.status(500).json({ err: error.message })
      }
  });

  router.get("/:recipeId", verifyToken, async (req, res) => {
    try {
      const recipe = await Recipe.findById(req.params.recipeId).populate([
        'author',
        'comments.author',
    ]);
      res.status(200).json(recipe);
    } catch (error) {
      res.status(500).json({ err: error.message });
    }
  });

router.put("/:recipeId", verifyToken, async (req, res) => {
    try {
      const recipe = await Recipe.findById(req.params.recipeId);
  
      if (!recipe.author.equals(req.user._id)) {
        return res.status(403).send("You dont have permission to do that!");
      }
  
      const updatedRecipe = await Recipe.findByIdAndUpdate(
        req.params.recipeId,
        req.body,
        { new: true }
      );
  
      updatedRecipe._doc.author = req.user;
  
      res.status(200).json(updatedRecipe);
    } catch (error) {
      res.status(500).json({ err: error.message });
    }
  });

  router.delete("/:recipeId", verifyToken, async (req, res) => {
    try {
      const recipe = await Recipe.findById(req.params.recipeId);
  
      if (!recipe.author.equals(req.user._id)) {
        return res.status(403).send("You dont have permission to do that!");
      }
  
      const deletedRecipe = await Recipe.findByIdAndDelete(req.params.recipeId);
      res.status(200).json(deletedRecipe);
    } catch (error) {
      res.status(500).json({ err: error.message });
    }
  });
  
  router.post("/:recipeId/comments", verifyToken, async (req, res) => {
    try {
      req.body.author = req.user._id;
      const recipe = await Recipe.findById(req.params.recipeId);
      recipe.comments.push(req.body);
      await recipe.save();
  
      const newComment = recipe.comments[recipe.comments.length - 1];
  
      newComment._doc.author = req.user;
  
      res.status(201).json(newComment);
    } catch (error) {
      res.status(500).json({ err: error.message });
    }
  });

  router.put("/:recipeId/comments/:commentId", verifyToken, async (req, res) => {
    try {
      const recipe = await Recipe.findById(req.params.recipeId);
      const comment = recipe.comments.id(req.params.commentId);
  
      if (comment.author.toString() !== req.user._id) {
        return res.status(403).json({ message: "You are not authorized to edit this comment" });
      }
  
      if (req.body.content) {
        comment.content = req.body.content;
    }
    if (req.body.rating) {
        comment.rating = req.body.rating;
    }

    await recipe.save();
    await recipe.populate('comments.author', 'username');
    
    res.status(200).json(comment);
} catch (error) {
    res.status(500).json({ err: error.message });
}
});

router.delete("/:recipeId/comments/:commentId", verifyToken, async (req, res) => {
    try {
      const recipe = await Recipe.findById(req.params.recipeId);
      const comment = recipe.comments.id(req.params.commentId);
  
      if (comment.author.toString() !== req.user._id) {
        return res.status(403).json({ message: "You are not authorized to edit this comment" });
      }
  
      recipe.comments.remove({ _id: req.params.commentId });
      await recipe.save();
      res.status(200).json({ message: "Comment deleted successfully" });
    } catch (error) {
      res.status(500).json({ err: error.message });
    }
  });

module.exports = router
