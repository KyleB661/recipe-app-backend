const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true })

const recipeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    ingredients: [{
        name: {
            type: String,
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        unit: {
            type: String,
            required: true
        }
    }],
    instructions: [{
        type: String,
        required: true
    }],
    prepTime: {
        type: Number,
        required: true
    },
    cookTime: {
        type: Number,
        required: true
    },
    servings: {
        type: Number,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    comments: [commentSchema]
}, {timestamps: true })

const Recipe = mongoose.model('Recipe', recipeSchema)

module.exports = Recipe