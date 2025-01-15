const Command = require('../../structures/Command');
const axios = require('axios');
const mathjs = require('mathjs');

class MathSolver extends Command {
    constructor() {
        super({
            name: 'math',
            aliases: ['calc', 'solve'],
            description: 'Advanced math problem solver',
            category: 'tools',
            usage: '.math <expression/equation>'
        });
    }

    async execute(message, args) {
        if (!args.length) {
            return message.reply(`╭─❒ 『 MATH SOLVER 』 ❒
│
├─❒ 🔢 *Features:*
│ • Basic Calculations
│ • Algebra
│ • Calculus
│ • Statistics
│ • Unit Conversion
│
├─❒ 📝 *Examples:*
│ • .math 2 + 2
│ • .math solve(x^2 = 4)
│ • .math derivative('x^2')
│ • .math 5cm to inches
│
╰──────────────────❒`);
        }

        const expression = args.join(' ');
        await message.reply('🔢 *Calculating...*');

        try {
            let result;
            if (expression.includes('solve')) {
                result = await this.solveEquation(expression);
            } else if (expression.includes('derivative')) {
                result = await this.calculateDerivative(expression);
            } else {
                result = mathjs.evaluate(expression);
            }

            const solution = `╭─❒ 『 MATH SOLUTION 』 ❒
│
├─❒ 📝 *Expression:*
│ ${expression}
│
├─❒ 🎯 *Result:*
│ ${result}
│
├─❒ 💡 *Simplified:*
│ ${mathjs.simplify(expression).toString()}
│
├─❒ ✨ *Powered by:* Dineth MD
│
╰──────────────────❒`;

            await message.reply(solution);

        } catch (error) {
            console.error('Math solver error:', error);
            message.reply('❌ Invalid expression or equation.');
        }
    }

    async solveEquation(equation) {
        // Implementation for equation solving
        return mathjs.evaluate(equation);
    }

    async calculateDerivative(expression) {
        // Implementation for derivative calculation
        return mathjs.derivative(expression, 'x').toString();
    }
}

module.exports = MathSolver; 