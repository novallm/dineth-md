const { MessageType } = require('@whiskeysockets/baileys');

class RecipeCommand {
    constructor() {
        this.name = 'recipe';
        this.description = 'Search recipes, get meal plans, and cooking tips';
    }

    async execute(client, message, args) {
        if (!args[0]) {
            return message.reply(`*👩‍🍳 Recipe Commands*\n\n` +
                `*.recipe search <ingredient>* - Find recipes by ingredient\n` +
                `*.recipe random* - Get random recipe suggestion\n` +
                `*.recipe meal-plan* - Generate weekly meal plan\n` +
                `*.recipe tips* - Get cooking tips`);
        }

        const subCommand = args[0].toLowerCase();

        switch (subCommand) {
            case 'search':
                const ingredient = args.slice(1).join(' ');
                if (!ingredient) {
                    return message.reply('❌ Please specify an ingredient to search for.');
                }
                
                // Example recipe data (integrate with a recipe API in production)
                const recipes = {
                    chicken: [
                        'Grilled Chicken Salad',
                        'Chicken Curry',
                        'Chicken Pasta'
                    ],
                    rice: [
                        'Fried Rice',
                        'Rice Pudding',
                        'Risotto'
                    ]
                };

                const foundRecipes = recipes[ingredient.toLowerCase()] || [];
                return message.reply(`*🍳 Recipes with ${ingredient}*\n\n${foundRecipes.join('\n') || 'No recipes found.'}`);

            case 'random':
                const randomRecipes = [
                    {
                        name: 'Spaghetti Carbonara',
                        ingredients: ['pasta', 'eggs', 'bacon', 'parmesan'],
                        time: '20 minutes'
                    },
                    {
                        name: 'Vegetable Stir Fry',
                        ingredients: ['mixed vegetables', 'soy sauce', 'ginger', 'garlic'],
                        time: '15 minutes'
                    }
                ];
                
                const recipe = randomRecipes[Math.floor(Math.random() * randomRecipes.length)];
                return message.reply(`*🍽️ Random Recipe*\n\n` +
                    `*${recipe.name}*\n` +
                    `⏱️ Time: ${recipe.time}\n` +
                    `📝 Ingredients:\n${recipe.ingredients.join('\n')}`);

            case 'meal-plan':
                return message.reply(`*📅 Weekly Meal Plan*\n\n` +
                    `Monday: Grilled Chicken Salad\n` +
                    `Tuesday: Vegetarian Pasta\n` +
                    `Wednesday: Fish Tacos\n` +
                    `Thursday: Quinoa Buddha Bowl\n` +
                    `Friday: Homemade Pizza\n` +
                    `Saturday: Stir-Fry Noodles\n` +
                    `Sunday: Slow Cooker Stew`);

            case 'tips':
                const cookingTips = [
                    'Always read the recipe completely before starting',
                    'Prep all ingredients before cooking (mise en place)',
                    'Keep your knives sharp for better control',
                    'Season throughout the cooking process'
                ];
                const randomTip = cookingTips[Math.floor(Math.random() * cookingTips.length)];
                return message.reply(`*👨‍🍳 Cooking Tip*\n\n${randomTip}`);

            default:
                return message.reply('❌ Invalid sub-command. Use *.recipe* to see available options.');
        }
    }
}

module.exports = RecipeCommand; 